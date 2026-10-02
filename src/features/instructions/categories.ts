import type { InstructionCategory } from '@/domain';
import type { ToneName } from '@/theme';

// Tag colour per library category.
export const categoryTones: Record<InstructionCategory, ToneName> = {
  situations: 'orange',
  characters: 'blue',
  emotions: 'pink',
  accents: 'green',
};

// Library filter: one category, or everything.
export type InstructionFilter = InstructionCategory | 'all';
