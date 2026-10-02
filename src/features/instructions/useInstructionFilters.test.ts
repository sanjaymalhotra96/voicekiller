import { describe, expect, it } from '@jest/globals';
import type { ActingInstruction } from '@/domain';
import { filterInstructions } from '@/features/instructions/useInstructionFilters';

const item = (
  name: string,
  category: ActingInstruction['category'],
): ActingInstruction => ({
  id: name,
  name,
  category,
  instructions: '',
  sampleScript: '',
  sampleAudioUrl: null,
});

const items = [
  item('Angry', 'emotions'),
  item('Alien', 'characters'),
  item('Advertisement', 'situations'),
];

describe('filterInstructions', () => {
  it('returns everything for all and no search', () => {
    expect(filterInstructions(items, 'all', '')).toHaveLength(3);
  });

  it('filters by category', () => {
    expect(filterInstructions(items, 'emotions', '').map(i => i.name)).toEqual([
      'Angry',
    ]);
  });

  it('searches names case-insensitively, combined with the category', () => {
    expect(filterInstructions(items, 'all', ' AL ').map(i => i.name)).toEqual([
      'Alien',
    ]);
    expect(filterInstructions(items, 'emotions', 'al')).toEqual([]);
  });
});
