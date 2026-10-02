import { describe, expect, it, jest } from '@jest/globals';
import { defaultSpeechSettings, Voice } from '@/domain';
import {
  titleFromScript,
  toGenerateRequest,
  toSpeechRequest,
} from '@/features/text-to-speech/request';
import { initialDraft, SpeechDraft } from '@/features/text-to-speech/store';

jest.mock('@/lib/storage', () => {
  const data = new Map<string, string>();
  return {
    secureStorage: {
      getString: (key: string) => data.get(key),
      set: (key: string, value: string) => data.set(key, value),
      remove: (key: string) => data.delete(key),
    },
  };
});

const voice = (provider: Voice['provider']): Voice => ({
  id: 'v1',
  name: 'Marcus',
  description: '',
  provider,
  gender: 'male',
  accent: 'en-US',
  language: 'en',
  source: 'library',
  previewUrl: null,
  isFavorite: false,
  createdAt: new Date(0),
});

const draft = (patch: Partial<SpeechDraft>): SpeechDraft => ({
  ...initialDraft,
  script: '  Hello there  ',
  emotion: 'happy',
  settings: { format: 'wav', speed: 1.5, delivery: 'creative' },
  instructionText: ' Whisper ',
  ...patch,
});

describe('toSpeechRequest', () => {
  it('needs a voice and a script', () => {
    expect(toSpeechRequest(draft({ voice: null }))).toBeNull();
    expect(toSpeechRequest(draft({ voice: voice('expressive'), script: '  ' }))).toBeNull();
  });

  it('sends emotion and tuning to expressive voices, not instructions', () => {
    expect(toSpeechRequest(draft({ voice: voice('expressive') }))).toEqual({
      script: 'Hello there',
      voiceId: 'v1',
      emotion: 'happy',
      settings: { format: 'wav', speed: 1.5, delivery: 'creative' },
      instructions: null,
    });
  });

  it('sends instructions to directable voices, with default tuning', () => {
    expect(toSpeechRequest(draft({ voice: voice('directable') }))).toEqual({
      script: 'Hello there',
      voiceId: 'v1',
      emotion: null,
      settings: { ...defaultSpeechSettings, format: 'wav' },
      instructions: 'Whisper',
    });
  });

  it('treats the auto emotion as none', () => {
    const request = toSpeechRequest(
      draft({ voice: voice('expressive'), emotion: 'auto' }),
    );
    expect(request?.emotion).toBeNull();
  });
});

describe('toGenerateRequest', () => {
  it('uses the file name, or the fallback title', () => {
    const base = draft({ voice: voice('qwenTts'), campaignId: 'c1' });
    expect(toGenerateRequest({ ...base, title: ' My file ' }, 'X')).toMatchObject({
      title: 'My file',
      campaignId: 'c1',
    });
    expect(toGenerateRequest(base, 'Fallback')?.title).toBe('Fallback');
  });
});

describe('titleFromScript', () => {
  it('keeps short scripts whole', () => {
    expect(titleFromScript('Hello world')).toBe('Hello world');
  });

  it('cuts long scripts at a word and drops pause tags', () => {
    expect(
      titleFromScript(
        'We are a <break time="1s" /> full-service design agency that builds things',
        30,
      ),
    ).toBe('We are a full-service design…');
  });
});
