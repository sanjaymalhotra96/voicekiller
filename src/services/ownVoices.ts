import type { Voice } from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';
import { toVoice } from '@/services/voices';

// Voices the user made: cloned (Voice Clone) and designed (Voice Design).
// Both are rows in public.voices with owner_id = the user.

export type OwnVoiceSource = 'cloned' | 'design';

type VoiceRow = TableRow<'voices'> & {
  voice_favorites: { user_id: string }[];
};

// Edge Functions return bare rows; give them the embedded favourites.
export const voiceFromRow = (row: TableRow<'voices'> & Partial<VoiceRow>) =>
  toVoice({ ...row, voice_favorites: row.voice_favorites ?? [] });

export const ownVoicesService = {
  async list(source: OwnVoiceSource): Promise<Voice[]> {
    const { data, error } = await supabase
      .from('voices')
      .select('*, voice_favorites(user_id)')
      .eq('source', source)
      .not('owner_id', 'is', null)
      .order('created_at', { ascending: false })
      .overrideTypes<VoiceRow[], { merge: false }>();
    if (isMissingTable(error)) {
      return [];
    }
    return (throwIfError({ data, error }).data ?? [])
      .map(toVoice)
      .filter((voice): voice is Voice => voice !== null);
  },

  async rename(id: string, name: string): Promise<void> {
    throwIfError(await supabase.from('voices').update({ name }).eq('id', id));
  },

  async remove(id: string): Promise<void> {
    throwIfError(await supabase.from('voices').delete().eq('id', id));
  },
};
