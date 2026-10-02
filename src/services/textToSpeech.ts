import { config } from '@/config';
import type {
  GenerateSpeechRequest,
  LibraryItem,
  SpeechRequest,
} from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { AppError } from '@/lib/errors';
import { invokeFunction } from '@/lib/functions';
import { toLibraryItem } from '@/services/library';

// Speech synthesis through Supabase Edge Functions, which hold the provider
// keys, check the user's remaining minutes and store the audio.
//
// Contract (implement in supabase/functions):
//   tts-preview   body: SpeechRequest
//                 200 -> { audioUrl: string }   (short, not saved)
//   tts-generate  body: GenerateSpeechRequest
//                 200 -> { item: library_items row }  (saved to Library)
//   Both: 402 when the user is out of minutes (see lib/errors).

export const speechService = {
  async preview(request: SpeechRequest): Promise<string> {
    const { audioUrl } = await invokeFunction<{ audioUrl: string }>(
      config.functions.previewSpeech,
      request,
    );
    return audioUrl;
  },

  async generate(request: GenerateSpeechRequest): Promise<LibraryItem> {
    const { item } = await invokeFunction<{ item: TableRow<'library_items'> }>(
      config.functions.generateSpeech,
      request,
    );
    const mapped = toLibraryItem(item);
    if (!mapped) {
      throw new AppError('unknown', item);
    }
    return mapped;
  },
};
