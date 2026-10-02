import { describe, expect, it } from '@jest/globals';
import {
  activeFilterCount,
  capabilitiesOf,
  countByCategory,
  defaultVoiceFilters,
  formatSpeed,
  insertAtSelection,
  noVoiceCapabilities,
  pauseTag,
  snapSpeed,
} from '@/domain';

describe('snapSpeed', () => {
  it.each([
    [1, 1],
    [1.04, 1],
    [1.06, 1.1],
    [0.1, 0.5],
    [9, 2],
    [1.2000000002, 1.2],
  ])('%p -> %p', (input, expected) => {
    expect(snapSpeed(input)).toBe(expected);
  });
});

describe('formatSpeed', () => {
  it('always shows one decimal', () => {
    expect(formatSpeed(1)).toBe('1.0X');
    expect(formatSpeed(0.5)).toBe('0.5X');
  });
});

describe('pauseTag', () => {
  it('builds an SSML-style break', () => {
    expect(pauseTag(1.5)).toBe('<break time="1.5s" />');
  });
});

describe('insertAtSelection', () => {
  const tag = '<p/>';

  it('inserts into empty text without padding', () => {
    expect(insertAtSelection('', { start: 0, end: 0 }, tag, 100)).toEqual({
      text: '<p/>',
      cursor: 4,
    });
  });

  it('pads with spaces between words', () => {
    expect(insertAtSelection('ab', { start: 1, end: 1 }, tag, 100)).toEqual({
      text: 'a <p/> b',
      cursor: 7,
    });
  });

  it('does not double existing spaces', () => {
    expect(insertAtSelection('a b', { start: 2, end: 2 }, tag, 100)).toEqual({
      text: 'a <p/> b',
      cursor: 7,
    });
  });

  it('replaces a selection', () => {
    expect(insertAtSelection('a XX b', { start: 2, end: 4 }, tag, 100)?.text).toBe(
      'a <p/> b',
    );
  });

  it('clamps an out-of-range selection to the end', () => {
    expect(insertAtSelection('ab', { start: 9, end: 9 }, tag, 100)?.text).toBe(
      'ab <p/>',
    );
  });

  it('refuses to exceed the maximum length', () => {
    expect(insertAtSelection('abc', { start: 3, end: 3 }, tag, 6)).toBeNull();
  });
});

describe('activeFilterCount', () => {
  it('counts only non-default filters', () => {
    expect(activeFilterCount(defaultVoiceFilters)).toBe(0);
    expect(
      activeFilterCount({
        provider: 'expressive',
        gender: 'female',
        accent: 'auto',
        language: 'en',
      }),
    ).toBe(3);
  });
});

describe('capabilitiesOf', () => {
  it('falls back to basic settings without a voice', () => {
    expect(capabilitiesOf(null)).toBe(noVoiceCapabilities);
  });

  it('reads the provider capabilities', () => {
    expect(capabilitiesOf({ provider: 'directable' })).toEqual({
      emotions: false,
      actingInstructions: true,
      tuning: false,
    });
  });
});

describe('countByCategory', () => {
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
