import {
  DesignSession,
  designLanguages,
  DesignVoiceInput,
  designProvider,
  Voice,
  VoiceVariation,
  voiceKey,
} from '@/domain';
import { apiRequest } from '@/lib/api';
import { saveAudio } from '@/lib/audioCache';
import { AppError } from '@/lib/errors';

// Voice Design (Studio plans).
//
// GET    /api/tts/design          -> { data: [{ id, name, voice_description,
//                                     audio_url, language, text, voice_id }] }
// POST   /api/tts/design/improve  { voice_description, language }
//                                 -> { improved_description }
// POST   /api/tts/design          { name, voice_description, language, mode }
//                                 -> { data: [{ voiceId, preview_audio_base64,
//                                     preview_text }], design_description }
// POST   /api/tts/design/save     { name, voice_description, language,
//                                   voice_id, preview_audio_base64,
//                                   preview_text }
// DELETE /api/tts/design          { id }

type DesignDto = {
  id: string | number;
  name?: string;
  voice_description?: string;
  audio_url?: string | null;
  language?: string;
  voice_id?: string;
};

type PreviewDto = {
  voiceId: string;
  preview_audio_base64: string;
  preview_text: string;
};

const toVoice = (design: DesignDto): Voice => {
  const voiceId = design.voice_id ?? String(design.id);
  return {
    id: voiceKey(designProvider, voiceId),
    voice: voiceId,
    name: design.name ?? '',
    description: design.voice_description ?? '',
    provider: designProvider,
    gender: 'neutral',
    accent: '',
    language: design.language ?? '',
    source: 'design',
    // Older rows may hold a data: URL, which the player cannot open.
    previewUrl: design.audio_url?.startsWith('http') ? design.audio_url : null,
    createdAt: null,
    plan: null,
    recordId: String(design.id),
    cloneEngine: null,
  };
};

// Previews arrive as base64 audio; the player needs a file.
const toVariation = (preview: PreviewDto): VoiceVariation => ({
  id: preview.voiceId,
  previewUrl: saveAudio(preview.preview_audio_base64, 'wav'),
  text: preview.preview_text,
  audioBase64: preview.preview_audio_base64,
});

// A 400 with `success: false` is a validation message from the API.
const validated = <T extends { success?: boolean }>(response: T) => {
  if (response.success === false) {
    throw new AppError('unknown', response);
  }
  return response;
};

export const voiceDesignService = {
  async listMine(): Promise<Voice[]> {
    const { data } = await apiRequest<{ data?: DesignDto[] }>('/api/tts/design');
    return (data ?? []).map(toVoice);
  },

  // AI rewrite of a rough description into a detailed one.
  async enhance({ description, language }: Omit<DesignVoiceInput, 'name'>) {
    const { improved_description } = validated(
      await apiRequest<{ success?: boolean; improved_description: string }>(
        '/api/tts/design/improve',
        {
          method: 'POST',
          body: {
            voice_description: description,
            language: designLanguages[language],
          },
        },
      ),
    );
    return improved_description;
  },

  // Three candidate voices for a description. Nothing is saved yet.
  async generate({ name, language, description }: DesignVoiceInput): Promise<DesignSession> {
    const response = validated(
      await apiRequest<{
        success?: boolean;
        data: PreviewDto[];
        design_description: string;
      }>('/api/tts/design', {
        method: 'POST',
        body: {
          name,
          voice_description: description,
          language: designLanguages[language],
          mode: 'freeform',
        },
        // Three voices are generated before the answer.
        timeoutMs: 3 * 60_000,
      }),
    );
    return {
      description: response.design_description,
      variations: response.data.map(toVariation),
    };
  },

  // Publishes the chosen variation; My Designs then refetches.
  async save({
    name,
    language,
    session,
    variation,
  }: DesignVoiceInput & { session: DesignSession; variation: VoiceVariation }) {
    validated(
      await apiRequest<{ success?: boolean }>('/api/tts/design/save', {
        method: 'POST',
        body: {
          name,
          voice_description: session.description,
          language: designLanguages[language],
          voice_id: variation.id,
          preview_audio_base64: variation.audioBase64,
          preview_text: variation.text,
        },
        timeoutMs: 2 * 60_000,
      }),
    );
  },

  async remove(voice: Voice): Promise<void> {
    await apiRequest('/api/tts/design', {
      method: 'DELETE',
      body: { id: voice.recordId },
    });
  },
};
