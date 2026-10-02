import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';
import type { LibraryItem, Voice } from '@/domain';
import { fromLibraryItem, fromVoice } from '@/features/results/adapters';
import { isResultTool, resultsRoute } from '@/features/results/types';

// Echo the key and options so tests can see what was asked for.
const t = ((key: string) => key) as unknown as TFunction;

const item = (patch: Partial<LibraryItem>): LibraryItem => ({
  id: 'i1',
  title: 'harvard',
  tool: 'voiceChanger',
  voiceName: null,
  durationSeconds: 1,
  audioUrl: 'https://example.com/a.mp3',
  createdAt: new Date(0),
  metadata: {},
  ...patch,
});

const voice: Voice = {
  id: 'v1',
  name: 'Warm Female Narrator',
  description: '',
  provider: 'expressive',
  gender: 'female',
  accent: 'auto',
  language: 'fr',
  source: 'design',
  previewUrl: null,
  isFavorite: false,
  createdAt: new Date(0),
};

describe('fromLibraryItem', () => {
  it('maps a plain file without a tag', () => {
    expect(fromLibraryItem(item({}), t)).toEqual({
      id: 'i1',
      title: 'harvard',
      audioUrl: 'https://example.com/a.mp3',
      createdAt: new Date(0),
      tag: undefined,
    });
  });

  it('tags enhanced cleans and transcription languages', () => {
    expect(
      fromLibraryItem(item({ tool: 'audioClean', metadata: { enhanced: true } }), t)
        .tag,
    ).toEqual({ label: 'results.enhanced' });
    expect(
      fromLibraryItem(item({ tool: 'speechToText', metadata: { language: 'ar' } }), t)
        .tag,
    ).toEqual({ label: 'languages.ar', icon: 'languages' });
  });
});

describe('fromVoice', () => {
  it('shows the language for designs only', () => {
    expect(fromVoice(voice, 'design', t).tag).toEqual({
      label: 'languages.fr',
      icon: 'languages',
    });
    expect(fromVoice(voice, 'cloned', t).tag).toBeUndefined();
  });
});

describe('result routes', () => {
  it('validates the tool param and builds the route', () => {
    expect(isResultTool('voiceDesign')).toBe(true);
    expect(isResultTool('textToSpeech')).toBe(false);
    expect(resultsRoute('voiceClone')).toBe('/results/voiceClone');
  });
});
