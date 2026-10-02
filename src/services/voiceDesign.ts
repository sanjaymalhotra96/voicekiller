import { config } from '@/config';
import type { DesignVoiceInput, Voice, VoiceVariation } from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { AppError } from '@/lib/errors';
import { invokeFunction } from '@/lib/functions';
import { voiceFromRow } from '@/services/ownVoices';

// Voice Design. Listing, renaming and deleting designs: services/ownVoices.
//
// Contracts (implement in supabase/functions):
//   voice-design-enhance   { description, language } -> { description }
//   voice-design-generate  { name, language, description }
//                          -> { sessionId, variations: [{ id, previewUrl, text }] }
//   voice-design-save      { sessionId, variationId, name, language, description }
//                          -> { voice: voices row }  (source = 'design')

type DesignSession = {
  sessionId: string;
  variations: VoiceVariation[];
};

const fn = config.functions;

export const voiceDesignService = {
  // AI rewrite of a rough description into a detailed one.
  enhance: async (input: { description: string; language: string }) =>
    (await invokeFunction<{ description: string }>(fn.designEnhance, input))
      .description,

  generate: (input: DesignVoiceInput) =>
    invokeFunction<DesignSession>(fn.designGenerate, input),

  async save(
    input: DesignVoiceInput & { sessionId: string; variationId: string },
  ): Promise<Voice> {
    const { voice } = await invokeFunction<{ voice: TableRow<'voices'> }>(
      fn.designSave,
      input,
    );
    const mapped = voiceFromRow(voice);
    if (!mapped) {
      throw new AppError('unknown', voice);
    }
    return mapped;
  },
};
