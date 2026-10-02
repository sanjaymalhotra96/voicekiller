import type { Campaign } from '@/domain';
import { AppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Campaigns API (public.campaigns). Screens use features/text-to-speech/hooks.ts.

// Postgres unique_violation: the user already has a campaign with that name.
const UNIQUE_VIOLATION = '23505';

export const campaignsService = {
  async list(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name')
      .order('created_at');
    if (isMissingTable(error)) {
      return [];
    }
    return throwIfError({ data, error }).data ?? [];
  },

  async create(name: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ name })
      .select('id, name')
      .single();
    if (error?.code === UNIQUE_VIOLATION) {
      throw new AppError('campaignExists', error);
    }
    return throwIfError({ data, error }).data as Campaign;
  },
};
