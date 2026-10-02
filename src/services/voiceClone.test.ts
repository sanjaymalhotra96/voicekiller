import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { config } from '@/config';
import { AppError } from '@/lib/errors';
import { clonesService } from '@/services/voiceClone';

const mockUpload = jest.fn<(...args: unknown[]) => Promise<void>>();
const mockInvoke =
  jest.fn<(...args: unknown[]) => Promise<{ data: unknown; error: unknown }>>();

jest.mock('expo-crypto', () => ({ randomUUID: () => 'uuid-1' }));

jest.mock('@/lib/uploadFile', () => ({
  uploadFile: (...args: unknown[]) => ({
    promise: mockUpload(...args),
    abort: () => {},
  }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
    },
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

const voiceRow = {
  id: 'v1',
  owner_id: 'user-1',
  name: 'Nabeel',
  description: '',
  provider: 'expressive',
  gender: 'male',
  accent: 'auto',
  language: 'en',
  source: 'cloned',
  preview_url: null,
  created_at: '2026-09-09T10:00:00Z',
};

const sample = {
  uri: 'file:///cache/Harvard.mp3',
  name: 'Harvard.mp3',
  mimeType: 'audio/mpeg',
  size: 1000,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpload.mockResolvedValue();
  mockInvoke.mockResolvedValue({ data: { voice: voiceRow }, error: null });
});

describe('clonesService.create', () => {
  it('streams the sample into the user folder, then clones it', async () => {
    const voice = await clonesService.create({
      name: 'Nabeel',
      language: 'en',
      sample,
    });

    expect(mockUpload).toHaveBeenCalledWith({
      bucket: config.clone.sampleBucket,
      path: 'user-1/uuid-1.mp3',
      file: sample,
    });
    expect(mockInvoke).toHaveBeenCalledWith(config.functions.createClone, {
      body: { name: 'Nabeel', language: 'en', samplePath: 'user-1/uuid-1.mp3' },
    });
    expect(voice).toMatchObject({
      id: 'v1',
      source: 'cloned',
      isFavorite: false,
      createdAt: new Date('2026-09-09T10:00:00Z'),
    });
  });

  it('does not call the server when the upload fails', async () => {
    mockUpload.mockRejectedValue(new AppError('uploadFailed'));
    await expect(
      clonesService.create({ name: 'N', language: 'en', sample }),
    ).rejects.toMatchObject({ code: 'uploadFailed' });
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});
