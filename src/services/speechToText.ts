import { config } from '@/config';
import {
  AudioSample,
  LanguageId,
  TranscriptSegment,
  TranslationLanguageId,
  translationLanguages,
} from '@/domain';
import { apiRequest, apiUpload, JobControls } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { pollJob } from '@/lib/poll';
import { toSegments } from '@/services/transcriptFile';

// Speech to Text.
//
// POST /api/speech-to-text  multipart { file, language_code?, translation? }
//   -> { job_id, audio_url }. A missing job_id means it did not start.
// GET  /api/speech-to-text/notifications?clear=false
//   -> { notifications: [{ record: { id, file_url } }] }  (kept ~5 min)
// GET  /api/speech-to-text/list-files
//   -> { files: [{ id, file_url, transcription (JSON file URL) }] }
// The server saves the finished transcript itself (speech_text, Library),
// so waiting can stop when the screen closes.

export type TranscriptionSession = {
  sessionId: string;
  audioUrl: string;
  segments: TranscriptSegment[];
};

type SpeechTextFile = { id: number; file_url: string; transcription: string | null };

const listFiles = async (signal?: AbortSignal) =>
  (
    await apiRequest<{ files?: SpeechTextFile[] }>('/api/speech-to-text/list-files', {
      signal,
    })
  ).files ?? [];

async function downloadTranscript(url: string, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    throw new AppError(signal?.aborted ? 'cancelled' : 'network', error);
  }
  if (!response.ok) {
    throw new AppError('notFound', url);
  }
  return (await response.json()) as Record<string, unknown>;
}

// List-files is checked every this many polls in case a notification
// was missed (they expire after ~5 minutes).
const listEvery = 6;

export const speechToTextService = {
  // Uploads, waits for the transcript, and returns it.
  async transcribe({
    file,
    language,
    translateTo,
    onProgress,
    signal,
  }: {
    file: AudioSample;
    language: LanguageId;
    translateTo: TranslationLanguageId | null;
  } & JobControls): Promise<TranscriptionSession> {
    const translation = translateTo ? translationLanguages[translateTo] : null;
    const started = await apiUpload<{ job_id?: string; audio_url: string }>(
      '/api/speech-to-text',
      {
        file,
        ...(language !== 'auto' ? { language_code: language } : null),
        ...(translation ? { translation } : null),
      },
      { onProgress, signal },
    );
    if (!started.job_id) {
      throw new AppError('jobFailed', started);
    }

    let polls = 0;
    const saved = await pollJob(
      async () => {
        polls++;
        const { notifications } = await apiRequest<{
          notifications?: { record?: { file_url?: string } }[];
        }>('/api/speech-to-text/notifications?clear=false', { signal });
        const notified = notifications?.some(
          item => item.record?.file_url === started.audio_url,
        );
        if (!notified && polls % listEvery !== 0) return undefined;
        return (await listFiles(signal)).find(
          item => item.file_url === started.audio_url,
        );
      },
      { ...config.jobs.transcription, signal },
    );

    const segments = saved.transcription
      ? toSegments(await downloadTranscript(saved.transcription, signal), translation)
      : [];
    return { sessionId: String(saved.id), audioUrl: saved.file_url, segments };
  },
};
