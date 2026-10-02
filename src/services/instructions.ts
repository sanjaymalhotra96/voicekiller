import { config } from '@/config';
import {
  ActingInstruction,
  CustomInstruction,
  isInstructionCategory,
} from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { invokeFunction } from '@/lib/functions';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Acting instructions API: the shared library (public.acting_instructions)
// and the user's own (public.custom_instructions).
// Screens use features/instructions/hooks.ts.

const toActingInstruction = (
  row: TableRow<'acting_instructions'>,
): ActingInstruction | null =>
  isInstructionCategory(row.category)
    ? {
        id: row.id,
        name: row.name,
        category: row.category,
        instructions: row.instructions,
        sampleScript: row.sample_script,
        sampleAudioUrl: row.sample_audio_url,
      }
    : null;

const toCustomInstruction = (
  row: TableRow<'custom_instructions'>,
): CustomInstruction => ({
  id: row.id,
  name: row.name,
  instructions: row.instructions,
  createdAt: new Date(row.created_at),
});

type NewInstructionInput = {
  name: string;
  // What the user wants ("robotic voice"); the AI writes the instructions.
  prompt: string;
};

export const instructionsService = {
  // The whole library (tens of rows); filtered and searched on device.
  async listLibrary(): Promise<ActingInstruction[]> {
    const { data, error } = await supabase
      .from('acting_instructions')
      .select('*')
      .order('sort_order')
      .order('name');
    if (isMissingTable(error)) {
      return [];
    }
    return (throwIfError({ data, error }).data ?? [])
      .map(toActingInstruction)
      .filter((item): item is ActingInstruction => item !== null);
  },

  async listCustom(): Promise<CustomInstruction[]> {
    const { data, error } = await supabase
      .from('custom_instructions')
      .select('*')
      .order('created_at', { ascending: false });
    if (isMissingTable(error)) {
      return [];
    }
    return (throwIfError({ data, error }).data ?? []).map(toCustomInstruction);
  },

  // The Edge Function writes the instructions with AI and saves the row.
  async generateCustom(
    input: NewInstructionInput,
  ): Promise<CustomInstruction> {
    const { item } = await invokeFunction<{
      item: TableRow<'custom_instructions'>;
    }>(config.functions.generateInstructions, input);
    return toCustomInstruction(item);
  },

  async removeCustom(id: string): Promise<void> {
    throwIfError(
      await supabase.from('custom_instructions').delete().eq('id', id),
    );
  },
};
