import {
  cloneProvider,
  CreateCloneInput,
  fileRules,
  Voice,
  voiceKey,
} from '@/domain';
import { config } from '@/config';
import { apiRequest, apiUpload } from '@/lib/api';
import { prepareUpload } from '@/lib/audioConvert';
import { AppError } from '@/lib/errors';

// Voice Clone.
//
// GET    /api/voice-clone/loadvoices
//   -> { voiceClones: [{ id, dbId, name, originalId, sample, provider,
//        gender, denoise, isCustom, CloneProvider }] }
// POST   /api/voice-clone   multipart { name, audio, provider: "V3", language }
//   -> { success, message }. Sample: 1 to 180 seconds, max 4 MB. Studio
//   plans keep one clone: a new one replaces the previous.
// DELETE /api/voice-clone/delete  { provider, modelId, id, name }

type CloneDto = {
  // Model id; empty when the plan saves only the sample.
  id?: string | null;
  dbId: string | number;
  name?: string;
  sample?: string | null;
  CloneProvider?: string;
};

const toVoice = (clone: CloneDto): Voice => ({
  id: voiceKey(cloneProvider, String(clone.dbId)),
  // "" makes the server clone from the sample for each request.
  voice: clone.id ?? '',
  name: clone.name ?? '',
  description: '',
  provider: cloneProvider,
  gender: 'neutral',
  accent: '',
  language: '',
  source: 'cloned',
  previewUrl: clone.sample || null,
  createdAt: null,
  plan: null,
  recordId: String(clone.dbId),
  cloneEngine: clone.CloneProvider ?? 'V1',
});

export const clonesService = {
  async listMine(): Promise<Voice[]> {
    const { voiceClones } = await apiRequest<{ voiceClones?: CloneDto[] }>(
      '/api/voice-clone/loadvoices',
    );
    return (voiceClones ?? []).map(toVoice);
  },

  // Uploads the sample; resolves once the clone is created.
  async create({ name, language, sample }: CreateCloneInput): Promise<void> {
    const response = await apiUpload<{ success?: boolean; message?: string }>(
      '/api/voice-clone',
      {
        name,
        language,
        provider: 'V3',
        // A video or recording (m4a) becomes mp3, cut to 30 seconds.
        audio: await prepareUpload(sample, fileRules.clone, {
          maxSeconds: config.clone.sampleSeconds,
          minSeconds: config.clone.minSampleSeconds,
        }),
      },
      // 400: the sample is shorter than 1 s or longer than 180 s.
      { codes: { 400: 'sampleLength' } },
    );
    if (response.success === false) {
      throw new AppError('unknown', response);
    }
  },

  async remove(voice: Voice): Promise<void> {
    await apiRequest('/api/voice-clone/delete', {
      method: 'DELETE',
      body: {
        provider: voice.cloneEngine,
        modelId: voice.voice,
        id: voice.recordId,
        name: voice.name,
      },
    });
  },
};
