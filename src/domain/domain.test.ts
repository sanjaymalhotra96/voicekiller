import { describe, expect, it } from '@jest/globals';
import {
  capabilitiesOf,
  exportTranscript,
  fileRules,
  formatSpeed,
  formatTimestamp,
  highestTier,
  insertAtSelection,
  planForTier,
  planFromAccountType,
  keptWordTimes,
  modelOf,
  snapSpeed,
  toGender,
  validateFile,
} from '@/domain';

describe('voices', () => {
  it('shows providers as models, never by name', () => {
    expect(modelOf('Gemini')).toBe('directablePro');
    expect(modelOf('OpenAI')).toBe('directable');
    for (const provider of ['IN', 'v4', 'v4in', 'Qwen-tts', 'something-new']) {
      expect(modelOf(provider)).toBe('expressive');
    }
  });

  it('offers only the controls a provider accepts', () => {
    expect(capabilitiesOf({ provider: 'Gemini', cloneEngine: null })).toMatchObject({
      actingInstructions: true,
      speed: null,
      emotions: false,
    });
    expect(capabilitiesOf({ provider: 'IN', cloneEngine: null })).toMatchObject({
      speed: { min: 0.5, max: 1.5 },
      delivery: true,
    });
    expect(capabilitiesOf({ provider: 'v4', cloneEngine: null })).toMatchObject({
      emotions: true,
      speed: { min: 0.5, max: 2 },
    });
    // Clones are Inworld-based: 0.5x to 1.5x.
    expect(capabilitiesOf({ provider: 'custom', cloneEngine: 'V3' }).speed).toEqual({
      min: 0.5,
      max: 1.5,
    });
    // V2 clones take emotions, not speed.
    expect(capabilitiesOf({ provider: 'custom', cloneEngine: 'V2' })).toMatchObject({
      emotions: true,
      speed: null,
    });
    expect(capabilitiesOf(null).speed).toBeNull();
  });

  it('reads catalog genders', () => {
    expect(toGender('Female')).toBe('female');
    expect(toGender('MALE')).toBe('male');
    expect(toGender(null)).toBe('neutral');
    expect(toGender('Cloned')).toBe('neutral');
  });
});

describe('speed', () => {
  it('snaps to a step inside the limits', () => {
    expect(snapSpeed(1.23)).toBe(1.2);
    expect(snapSpeed(9)).toBe(2);
    expect(snapSpeed(0.1)).toBe(0.5);
    // A 2x saved for another voice is sent as 1.5x to Inworld voices.
    expect(snapSpeed(2, { min: 0.5, max: 1.5 })).toBe(1.5);
  });

  it('formats like the design', () => {
    expect(formatSpeed(1)).toBe('1.0X');
    expect(formatSpeed(0.5)).toBe('0.5X');
  });
});

describe('insertAtSelection', () => {
  it('adds spaces where the snippet would touch a word', () => {
    expect(insertAtSelection('helloworld', { start: 5, end: 5 }, '[pause]', 100)).toEqual({
      text: 'hello [pause] world',
      cursor: 14,
    });
  });

  it('replaces the selected text', () => {
    expect(insertAtSelection('a bad day', { start: 2, end: 5 }, 'good', 100)?.text).toBe(
      'a good day',
    );
  });

  it('refuses to go over the limit', () => {
    expect(insertAtSelection('abc', { start: 3, end: 3 }, 'defgh', 5)).toBeNull();
  });
});

describe('speech editor word times', () => {
  const words = [
    { word: 'Hello,', start: 0, end: 0.5 },
    { word: 'this', start: 0.5, end: 0.7 },
    { word: 'is', start: 0.7, end: 0.8 },
    { word: 'a', start: 0.8, end: 0.9 },
    { word: 'test', start: 0.9, end: 1.4 },
  ];

  it('keeps every word when text is only added', () => {
    expect(keptWordTimes(words, 'hello this is a great test')).toEqual(words);
  });

  it('leaves out deleted words, ignoring case and punctuation', () => {
    expect(keptWordTimes(words, 'HELLO this test').map(w => w.word)).toEqual([
      'Hello,',
      'this',
      'test',
    ]);
  });

  it('returns nothing when every word is replaced', () => {
    expect(keptWordTimes(words, 'completely different')).toEqual([]);
  });
});

describe('transcript export', () => {
  const segments = [
    { start: 0.1, end: 3.05, text: ' First line ' },
    { start: 3.05, end: 3661.5, text: 'Second' },
  ];

  it('formats timestamps', () => {
    expect(formatTimestamp(3.05)).toBe('00:00:03,050');
    expect(formatTimestamp(3661.5, '.')).toBe('01:01:01.500');
    expect(formatTimestamp(-1)).toBe('00:00:00,000');
  });

  it('writes SRT, VTT and plain text', () => {
    expect(exportTranscript(segments, 'srt')).toBe(
      '1\n00:00:00,100 --> 00:00:03,050\nFirst line\n\n2\n00:00:03,050 --> 01:01:01,500\nSecond\n',
    );
    expect(exportTranscript(segments, 'vtt').startsWith('WEBVTT\n\n00:00:00.100 --> ')).toBe(true);
    expect(exportTranscript(segments, 'txt')).toBe('First line\nSecond');
  });
});

describe('file rules', () => {
  it('accepts audio and video, by extension', () => {
    expect(validateFile({ name: 'clip.MOV', size: null }, fileRules.transcription)).toBeNull();
    expect(validateFile({ name: 'notes.pdf', size: null }, fileRules.transcription)).toBe(
      'fileType',
    );
  });

  it('applies the API size limit', () => {
    const fourMb = 4 * 1024 * 1024;
    expect(validateFile({ name: 'a.mp3', size: fourMb }, fileRules.clone)).toBeNull();
    expect(validateFile({ name: 'a.mp3', size: fourMb + 1 }, fileRules.clone)).toBe(
      'fileTooLarge',
    );
  });
});

describe('account plan', () => {
  it('shows every Studio account type as Studio, the rest as Basic', () => {
    for (const type of ['studio', 'studio_max', 'studio_lifetime']) {
      expect(planFromAccountType(type)).toBe('studio');
    }
    for (const type of ['free', 'pro', 'pro_max', null, undefined, 42]) {
      expect(planFromAccountType(type)).toBe('basic');
    }
  });
});

describe('subscriptions', () => {
  it('uses the highest active tier', () => {
    expect(highestTier([])).toBeNull();
    expect(highestTier(['pro'])).toBe('pro');
    expect(highestTier(['pro', 'studio'])).toBe('studio');
    expect(highestTier(['unknown'])).toBeNull();
  });

  it('shows Studio for a Studio subscription, the account plan otherwise', () => {
    expect(planForTier('studio')).toBe('studio');
    expect(planForTier('studio_max')).toBe('studio');
    expect(planForTier('pro')).toBeNull();
    expect(planForTier(null)).toBeNull();
  });
});
