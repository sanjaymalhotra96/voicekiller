import { config } from '@/config';
import type { TranscriptSegment } from '@/domain';
import { invokeFunction } from '@/lib/functions';

// The audio tools. Each runs in a Supabase Edge Function that reads the
// uploaded source from the media-sources bucket (paths come from
// useUploadSlot), calls the provider, stores the result and inserts a row
// in the tool's own table, which Library then reads (services/library.ts).
//
// Contracts (implement in supabase/functions):
//   voice-changer-convert      { sourcePath, targetPath }
//                              -> { id }   row in voice_conversion
//   audio-clean                { sourcePath, enhance }
//                              -> { id }   row in denoise_results
//                                          (operation: denoised[_enhanced])
//   speech-editor-transcribe   { sourcePath }
//                              -> { sessionId, audioUrl, transcript }
//   speech-editor-synthesize   { sessionId, transcript }
//                              -> { audioUrl }   (edited preview, not saved)
//   speech-editor-save         { sessionId, transcript }
//                              -> { id }   row in transcription
//   speech-to-text-transcribe  { sourcePath, language, translateTo }
//                              -> { sessionId, audioUrl, segments }
//   speech-to-text-save        { sessionId, segments }
//                              -> { id }   row in speech_text
// Errors: see lib/errors (402, 404, 5xx).

// Runs a job whose result is saved by the server; resolves when it is.
async function invokeForItem(
  name: string,
  body: Record<string, unknown>,
): Promise<void> {
  await invokeFunction<{ id: string }>(name, body);
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
