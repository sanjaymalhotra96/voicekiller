// Acting instructions: the shared library and the user's own.
// Categories supported by the library filters.

export const instructionCategories = [
  'emotions',
  'characters',
  'situations',
  'accents',
] as const;
export type InstructionCategory = (typeof instructionCategories)[number];

export const isInstructionCategory = (
  value: string,
): value is InstructionCategory =>
  (instructionCategories as readonly string[]).includes(value);

// Library entry (public.instructions).
export type ActingInstruction = {
  id: string;
  name: string;
  category: InstructionCategory | null;
  instructions: string;
  sampleScript: string;
  sampleAudioUrl: string | null;
};

// This database entry tells the speech API to derive directions from the script.
export const isAutomaticInstruction = (
  item: Pick<ActingInstruction, 'name' | 'instructions'>,
) =>
  item.name.trim() === 'AI' &&
  item.instructions.trim() === 'Generate instructions based on the script';

// The user's own (public.custom_instructions).
export type CustomInstruction = {
  id: string;
  name: string;
  instructions: string;
  createdAt: Date;
};

// The instruction picked for the current script. The text itself is kept
// separately in the editor so the user can tweak it.
export type SelectedInstruction = {
  id: string;
  name: string;
  source: 'library' | 'custom';
};

// Counts per category for the filter chips ("Emotions (22)").
export function countByCategory(
  items: readonly Pick<ActingInstruction, 'category'>[],
) {
  const counts = Object.fromEntries(
    instructionCategories.map(category => [category, 0]),
  ) as Record<InstructionCategory, number>;
  for (const item of items) {
    if (item.category !== null) {
      counts[item.category] += 1;
    }
  }
  return counts;
}
