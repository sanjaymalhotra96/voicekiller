import { describe, expect, it } from '@jest/globals';
import {
  activeFilterCount,
  countByCategory,
  defaultVoiceFilters,
  entryGroups,
  fileExtension,
  isFirstSignIn,
  isInstructionCategory,
  isLanguageId,
  isLibrarySource,
  isRtlLanguage,
  maxMegabytes,
  pauseTag,
  voiceKey,
  yearlySavingsPercent,
} from '@/domain';

describe('entry groups', () => {
  it('opens exactly one group for every sign-in / onboarding state', () => {
    for (const signedIn of [true, false]) {
      for (const onboarded of [true, false]) {
        const groups = entryGroups(signedIn, onboarded);
        expect(Object.values(groups).filter(Boolean)).toHaveLength(1);
      }
    }
  });

  it('shows onboarding first, then auth, and the app once signed in', () => {
    expect(entryGroups(false, false).onboarding).toBe(true);
    expect(entryGroups(false, true).auth).toBe(true);
    // A signed-in user never sees onboarding, even on a fresh install.
    expect(entryGroups(true, false).app).toBe(true);
  });
});

describe('subscriptions', () => {
  it('works out the yearly saving against twelve monthly payments', () => {
    expect(yearlySavingsPercent(9, 90)).toBe(17);
    expect(yearlySavingsPercent(10, 60)).toBe(50);
  });

  it('hides the saving when yearly is not cheaper or a price is missing', () => {
    expect(yearlySavingsPercent(9, 108)).toBeNull();
    expect(yearlySavingsPercent(9, 200)).toBeNull();
    expect(yearlySavingsPercent(0, 90)).toBeNull();
    expect(yearlySavingsPercent(9, Number.NaN)).toBeNull();
  });

  it('treats a sign-in soon after the account was created as the first', () => {
    const created = '2026-10-08T10:00:00Z';
    expect(isFirstSignIn(created, '2026-10-08T10:00:05Z')).toBe(true);
    // Email code typed a few minutes later.
    expect(isFirstSignIn(created, '2026-10-08T10:20:00Z')).toBe(true);
  });

  it('treats later sign-ins and missing dates as not the first', () => {
    expect(isFirstSignIn('2026-01-01T10:00:00Z', '2026-10-08T10:00:00Z')).toBe(
      false,
    );
    expect(isFirstSignIn(undefined, '2026-10-08T10:00:00Z')).toBe(false);
    expect(isFirstSignIn('2026-10-08T10:00:00Z', undefined)).toBe(false);
    expect(isFirstSignIn('not a date', 'also not')).toBe(false);
  });
});

describe('instructions', () => {
  it('recognises only the database categories', () => {
    expect(isInstructionCategory('emotions')).toBe(true);
    expect(isInstructionCategory('Emotions')).toBe(false);
    expect(isInstructionCategory('')).toBe(false);
  });

  it('counts every category, including empty ones', () => {
    expect(
      countByCategory([
        { category: 'emotions' },
        { category: 'emotions' },
        { category: 'accents' },
      ]),
    ).toEqual({ emotions: 2, characters: 0, situations: 0, accents: 1 });
  });
});

describe('library and media', () => {
  it('recognises library sources', () => {
    expect(isLibrarySource('textToSpeech')).toBe(true);
    expect(isLibrarySource('unknown')).toBe(false);
  });

  it('reads the lower-case extension of a file name', () => {
    expect(fileExtension('Take 1.MP3')).toBe('mp3');
    expect(fileExtension('archive.tar.gz')).toBe('gz');
    expect(fileExtension('README')).toBe('');
  });

  it('shows file limits in whole megabytes', () => {
    expect(
      maxMegabytes({
        extensions: [],
        mimeTypes: [],
        maxBytes: 50 * 1024 * 1024,
      }),
    ).toBe(50);
  });
});

describe('speech helpers', () => {
  it('flags right-to-left languages', () => {
    expect(isRtlLanguage('ar')).toBe(true);
    expect(isRtlLanguage('he')).toBe(true);
    expect(isRtlLanguage('en')).toBe(false);
    expect(isRtlLanguage(null)).toBe(false);
  });

  it('writes pauses as SSML break tags', () => {
    expect(pauseTag(1.5)).toBe('<break time="1.5s" />');
  });
});

describe('voices', () => {
  it('keys a voice by provider and id', () => {
    expect(voiceKey('Gemini', 'Puck')).toBe('Gemini:Puck');
  });

  it('counts only the filters changed from the defaults', () => {
    expect(activeFilterCount(defaultVoiceFilters)).toBe(0);
    expect(
      activeFilterCount({
        ...defaultVoiceFilters,
        gender: 'female',
        language: 'ar',
      }),
    ).toBe(2);
  });

  it('recognises supported language ids', () => {
    expect(isLanguageId('ar')).toBe(true);
    expect(isLanguageId('xx')).toBe(false);
  });
});
