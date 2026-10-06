import { config } from '@/config';
import type { AudioSample, WordTiming } from '@/domain';
import { apiRequest, apiUpload, JobControls, studioOnly } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { pollJob } from '@/lib/poll';
import { untypedSupabase } from '@/lib/supabase';
import { throwIfError } from '@/lib/supabaseResult';
import { asNumber, asText } from '@/utils';

// Speech Editor (Studio plans). Files live in the `transcription` table,
// which Library reads (services/library.ts).
//
// POST /api/transcribe  multipart { mediaFile }  (max 20 MB, 2 minutes)
//   -> { filename, fileUrl }; waits for the transcription.
// GET  /api/transcribe/list -> { transcriptions: [{ id, media_url }] }
// POST /api/transcribe/inpaint  { file_id, audio_url, input_text,
//   output_text, word_times } -> { data: { job_id } }
// GET  /api/transcribe/inpaint/status/:jobId
//   -> { status: IN_QUEUE | IN_PROGRESS | COMPLETED | FAILED }
// Word timings and the edited audio are only in the `transcription` row
// (transcription, updated_speech), read here with the user's session.

export type EditorSession = {
  fileId: number;
  // The uploaded recording.
  mediaUrl: string;
  // Original words with their timings, and their text.
  words: WordTiming[];
  transcript: string;
};

// One word of the stored transcription; the exact keys vary by provider.
const toWord = (item: Record<string, unknown>): WordTiming | null => {
  const word =
    asText(item.word) || asText(item.text) || asText(item.punctuated_word);
  return word
    ? {
        word,
        start: asNumber(item.start ?? item.start_time),
        end: asNumber(item.end ?? item.end_time),
      }
    : null;
};

const parseWords = (value: unknown): WordTiming[] => {
  const list = typeof value === 'string' ? JSON.parse(value) : value;
  return Array.isArray(list)
    ? list.map(toWord).filter((word): word is WordTiming => word !== null)
    : [];
};

const editorRow = async (fileId: number) =>
  throwIfError(
    await untypedSupabase
      .from('transcription')
      .select('transcription, updated_speech')
      .eq('id', fileId)
      .single(),
  ).data as { transcription: unknown; updated_speech: string | null };

export const speechEditorService = {
  // Uploads and transcribes a recording; the new file is in Library.
  async transcribe({
    file,
    onProgress,
    signal,
  }: { file: AudioSample } & JobControls): Promise<EditorSession> {
    const { fileUrl } = await apiUpload<{ fileUrl: string }>(
      '/api/transcribe',
      { mediaFile: file },
      { codes: studioOnly, onProgress, signal },
    );
    // The upload answer has no id: find the file by its URL.
    const { transcriptions } = await apiRequest<{
      transcriptions: { id: number; media_url: string }[];
    }>('/api/transcribe/list', { signal });
    const saved = transcriptions.find(item => item.media_url === fileUrl);
    if (!saved) {
      throw new AppError('notFound', fileUrl);
    }
    const words = parseWords((await editorRow(saved.id)).transcription);
    return {
      fileId: saved.id,
      mediaUrl: fileUrl,
      words,
      transcript: words.map(item => item.word).join(' '),
    };
  },

  // Rewrites the recording to say `outputText`; resolves with the new
  // audio URL once it is saved on the editor file.
  async inpaint({
    session,
    inputText,
    outputText,
    wordTimes,
  }: {
    session: EditorSession;
    inputText: string;
    outputText: string;
    wordTimes: WordTiming[];
  }): Promise<string> {
    const { data } = await apiRequest<{ data: { job_id: string } }>(
      '/api/transcribe/inpaint',
      {
        method: 'POST',
        body: {
          file_id: session.fileId,
          audio_url: session.mediaUrl,
          input_text: inputText,
          output_text: outputText,
          word_times: wordTimes,
        },
      },
    );
    await pollJob(async () => {
      const job = await apiRequest<{ status: string; error?: string }>(
        `/api/transcribe/inpaint/status/${encodeURIComponent(data.job_id)}`,
        { codes: studioOnly },
      );
      if (job.status === 'COMPLETED') return true;
      if (job.status === 'FAILED') throw new AppError('jobFailed', job.error);
      return undefined;
    }, config.jobs.inpaint);

    const { updated_speech } = await editorRow(session.fileId);
    if (!updated_speech) {
      throw new AppError('jobFailed', 'no updated_speech');
    }
    return updated_speech;
  },
};
