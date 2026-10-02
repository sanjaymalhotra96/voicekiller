import { config } from '@/config';
import type { LibraryItem, TranscriptSegment } from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { AppError } from '@/lib/errors';
import { invokeFunction } from '@/lib/functions';
import { toLibraryItem } from '@/services/library';

// The audio tools. Each runs in a Supabase Edge Function that reads the
// uploaded source from the media-sources bucket (paths come from
// useUploadSlot), calls the provider, stores the result and inserts a
// library_items row for the user. Results are listed with libraryService.
//
// Contracts (implement in supabase/functions):
//   voice-changer-convert      { sourcePath, targetPath }
//                              -> { item }
//   audio-clean                { sourcePath, enhance }
//                              -> { item }   metadata.enhanced = enhance
//   speech-editor-transcribe   { sourcePath }
//                              -> { sessionId, audioUrl, transcript }
//   speech-editor-synthesize   { sessionId, transcript }
//                              -> { audioUrl }   (edited preview, not saved)
//   speech-editor-save         { sessionId, transcript }
//                              -> { item }
//   speech-to-text-transcribe  { sourcePath, language, translateTo }
//                              -> { sessionId, audioUrl, segments }
//   speech-to-text-save        { sessionId, segments }
//                              -> { item }   (+ public.transcripts row)
// `item` is a library_items row. Errors: see lib/errors (402, 404, 5xx).

type ItemResponse = { item: TableRow<'library_items'> };

async function invokeForItem(
  name: string,
  body: Record<string, unknown>,
): Promise<LibraryItem> {
  const { item } = await invokeFunction<ItemResponse>(name, body);
  const mapped = toLibraryItem(item);
  if (!mapped) {
    throw new AppError('unknown', item);
  }
  return mapped;
}

const fn = config.functions;

export const voiceChangerService = {
  convert: (input: { sourcePath: string; targetPath: string }) =>
    invokeForItem(fn.changeVoice, input),
};

export const audioCleanService = {
  clean: (input: { sourcePath: string; enhance: boolean }) =>
    invokeForItem(fn.cleanAudio, input),
};

export type EditorSession = {
  sessionId: string;
  audioUrl: string;
  transcript: string;
};

export const speechEditorService = {
  transcribe: (input: { sourcePath: string }) =>
    invokeFunction<EditorSession>(fn.editorTranscribe, input),
  synthesize: async (input: { sessionId: string; transcript: string }) =>
    (await invokeFunction<{ audioUrl: string }>(fn.editorSynthesize, input))
      .audioUrl,
  save: (input: { sessionId: string; transcript: string }) =>
    invokeForItem(fn.editorSave, input),
};

export type TranscriptionSession = {
  sessionId: string;
  audioUrl: string;
  segments: TranscriptSegment[];
};

export const speechToTextService = {
  transcribe: (input: {
    sourcePath: string;
    language: string;
    translateTo: string | null;
  }) => invokeFunction<TranscriptionSession>(fn.sttTranscribe, input),
  save: (input: { sessionId: string; segments: TranscriptSegment[] }) =>
    invokeForItem(fn.sttSave, input),
};
