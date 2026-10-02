import { config } from '@/config';
import {
  isGender,
  isVoiceProviderId,
  Voice,
  VoiceCursor,
  VoiceQuery,
} from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { afterKeyset, escapeLike } from '@/lib/postgrest';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Voice catalog API (public.voices + public.voice_favorites).
// Screens use features/voices/hooks.ts.

export type VoicePage = { items: Voice[]; nextCursor: VoiceCursor | null };

type VoiceRow = TableRow<'voices'> & {
  // Embedded favourites; RLS returns only the current user's row.
  voice_favorites: { user_id: string }[];
};

const SOURCES = ['library', 'cloned', 'design'] as const;
type StoredSource = (typeof SOURCES)[number];
const isStoredSource = (value: string): value is StoredSource =>
  (SOURCES as readonly string[]).includes(value);

export const toVoice = (row: VoiceRow): Voice | null =>
  isVoiceProviderId(row.provider) &&
  isGender(row.gender) &&
  isStoredSource(row.source)
    ? {
        id: row.id,
        name: row.name,
        description: row.description,
        provider: row.provider,
        gender: row.gender,
        accent: row.accent,
        language: row.language,
        source: row.source,
        previewUrl: row.preview_url,
        isFavorite: row.voice_favorites.length > 0,
        createdAt: new Date(row.created_at),
      }
    : null;

// `!inner` keeps only voices the user has favourited.
const SELECT_ALL = '*, voice_favorites(user_id)';
const SELECT_FAVORITES = '*, voice_favorites!inner(user_id)';

export const voicesService = {
  // Alphabetical, keyset-paginated; every filter runs in the database.
  async list({
    cursor,
    source,
    search,
    filters,
  }: VoiceQuery & { cursor: VoiceCursor | null }): Promise<VoicePage> {
    const size = config.voices.pageSize;
    const favorites = source === 'favorites';

    let query = supabase
      .from('voices')
      .select(favorites ? SELECT_FAVORITES : SELECT_ALL)
      .order('name', { ascending: true })
      .order('id', { ascending: true })
      .limit(size);
    if (!favorites) {
      query = query.eq('source', source);
    }
    if (cursor) {
      query = query.or(afterKeyset('name', cursor.name, cursor.id, 'asc'));
    }
    if (search) {
      query = query.ilike('name', `%${escapeLike(search)}%`);
    }
    if (filters.provider !== 'all') {
      query = query.eq('provider', filters.provider);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }
    if (filters.accent !== 'auto') {
      query = query.eq('accent', filters.accent);
    }
    if (filters.language !== 'auto') {
      query = query.eq('language', filters.language);
    }

    const { data, error } = await query.overrideTypes<
      VoiceRow[],
      { merge: false }
    >();
    if (isMissingTable(error)) {
      return { items: [], nextCursor: null };
    }
    const rows = throwIfError({ data, error }).data ?? [];
    const last = rows[rows.length - 1];

    return {
      items: rows.map(toVoice).filter((v): v is Voice => v !== null),
      nextCursor:
        rows.length === size && last ? { name: last.name, id: last.id } : null,
    };
  },

  async setFavorite(voiceId: string, favorite: boolean): Promise<void> {
    const table = supabase.from('voice_favorites');
    throwIfError(
      favorite
        ? await table.upsert({ voice_id: voiceId }, { ignoreDuplicates: true })
        : await table.delete().eq('voice_id', voiceId),
    );
  },
};
