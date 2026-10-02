import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { config } from '@/config';
import {
  audioCleanService,
  speechEditorService,
  voiceChangerService,
} from '@/services/mediaTools';
import { voiceDesignService } from '@/services/voiceDesign';

const mockInvoke =
  jest.fn<(...args: unknown[]) => Promise<{ data: unknown; error: unknown }>>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

const itemRow = {
  id: 'i1',
  user_id: 'u1',
  title: 'harvard_enhance',
  tool: 'audioClean',
  voice_name: null,
  duration_seconds: 18,
  audio_url: 'https://example.com/out.mp3',
  campaign_id: null,
  metadata: { enhanced: true },
  created_at: '2026-09-09T10:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('library-producing tools', () => {
  it('sends the paths and maps the saved file', async () => {
    mockInvoke.mockResolvedValue({ data: { item: itemRow }, error: null });

    const item = await audioCleanService.clean({
      sourcePath: 'u1/a.wav',
      enhance: true,
    });

    expect(mockInvoke).toHaveBeenCalledWith(config.functions.cleanAudio, {
      body: { sourcePath: 'u1/a.wav', enhance: true },
    });
    expect(item).toMatchObject({
      id: 'i1',
      tool: 'audioClean',
      metadata: { enhanced: true },
    });
  });

  it('rejects a row from an unknown tool', async () => {
    mockInvoke.mockResolvedValue({
      data: { item: { ...itemRow, tool: 'retired' } },
      error: null,
    });
    await expect(
      voiceChangerService.convert({ sourcePath: 'a', targetPath: 'b' }),
    ).rejects.toMatchObject({ code: 'unknown' });
  });

  it('returns only the URL from speech editor synthesis', async () => {
    mockInvoke.mockResolvedValue({
      data: { audioUrl: 'https://example.com/edit.mp3' },
      error: null,
    });
    await expect(
      speechEditorService.synthesize({ sessionId: 's1', transcript: 'Hi' }),
    ).resolves.toBe('https://example.com/edit.mp3');
  });
});

describe('voiceDesignService', () => {
  it('returns the enhanced description text', async () => {
    mockInvoke.mockResolvedValue({
      data: { description: 'Warm, deep male voice.' },
      error: null,
    });
    await expect(
      voiceDesignService.enhance({ description: 'deep man', language: 'en' }),
    ).resolves.toBe('Warm, deep male voice.');
    expect(mockInvoke).toHaveBeenCalledWith(config.functions.designEnhance, {
      body: { description: 'deep man', language: 'en' },
    });
  });
});
