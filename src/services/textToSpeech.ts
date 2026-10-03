import { config } from '@/config';
import type {
  GenerateSpeechRequest,
  SpeechRequest,
} from '@/domain';
import { invokeFunction } from '@/lib/functions';

// Speech synthesis through Supabase Edge Functions, which hold the provider
// keys, check the user's remaining minutes and store the audio.
//
// Contract (implement in supabase/functions):
//   tts-preview   body: SpeechRequest
//                 200 -> { audioUrl: string }   (short, not saved)
//   tts-generate  body: GenerateSpeechRequest
//                 200 -> { id }   row in generated_files (shows in Library)
//   Both: 402 when the user is out of minutes (see lib/errors).

export const speechService = {
  async preview(request: SpeechRequest): Promise<string> {
    const { audioUrl } = await invokeFunction<{ audioUrl: string }>(
      config.functions.previewSpeech,
      request,
    );
    return audioUrl;
  },

  // Resolves once the file is saved; Library then refetches it.
  async generate(request: GenerateSpeechRequest): Promise<void> {
    await invokeFunction<{ id: string }>(config.functions.generateSpeech, request);
  },
};
