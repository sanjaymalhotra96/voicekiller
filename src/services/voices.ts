import { config } from '@/config';
import {
  FavoriteVoice,
  modelOf,
  modelProviders,
  toGender,
  Voice,
  VoiceCursor,
  voiceKey,
  VoiceQuery,
} from '@/domain';
import { apiRequest } from '@/lib/api';
import type { TableRow } from '@/lib/database.types';
import { afterKeyset, escapeLike } from '@/lib/postgrest';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';
import { ownVoicesService } from '@/services/ownVoices';

// Voices for the "Select Voice" picker. Screens use features/voices/hooks.ts.
//
// Library tab: the voice catalog, read from the public.voices table
// (GET /api/tts/voicelist is not used).
// Cloned / Design tabs: the user's own voices (services/ownVoices).
// Favorites:
//   GET  /api/tts/get-favorite                 -> { voices: FavoriteVoice[] }
//   POST /api/tts/get-favorite/add-favorite    { voices, is_new } -> { voices }
//   POST /api/tts/get-favorite/delete          { voices }          -> { voices }
//   Both POSTs take the FULL list to keep.

export type VoicePage = { items: Voice[]; nextCursor: VoiceCursor | null };

type VoiceRow = TableRow<'voices'>;

const columns =
  'id, voice, display_name, gender, sample, provider, locale, language, plan, description, created_at';

// Samples are stored as site paths ("/samples/Anja.mp3") or full URLs.
const sampleUrl = (sample: string | null) =>
  !sample ? null : sample.startsWith('/') ? `${config.api.baseUrl}${sample}` : sample;

const fromRow = (row: VoiceRow): Voice => ({
  id: voiceKey(row.provider, row.voice),
  voice: row.voice,
  name: row.display_name,
  description: (row.description ?? []).join(' '),
  provider: row.provider,
  gender: toGender(row.gender),
  accent: row.locale ?? '',
  language: row.language ?? '',
  source: 'library',
  previewUrl: sampleUrl(row.sample),
  createdAt: new Date(row.created_at),
  plan: row.plan,
  recordId: null,
  cloneEngine: null,
});

const fromFavorite = (favorite: FavoriteVoice): Voice => ({
  id: voiceKey(favorite.provider, favorite.voice),
  voice: favorite.voice,
  name: favorite.displayName,
  description: '',
  provider: favorite.provider,
  gender: 'neutral',
  accent: '',
  language: '',
  source: 'library',
  previewUrl: null,
  createdAt: null,
  plan: null,
  recordId: null,
  cloneEngine: null,
});

// Search and model filter for lists the API returns whole.
function filterLocally(voices: Voice[], { search, filters }: VoiceQuery) {
  const term = search.trim().toLowerCase();
  return voices.filter(
    voice =>
      (!term || voice.name.toLowerCase().includes(term)) &&
      (filters.model === 'all' || modelOf(voice.provider) === filters.model),
  );
}

async function listCatalog({
  cursor,
  search,
  filters,
}: VoiceQuery & { cursor: VoiceCursor | null }): Promise<VoicePage> {
  const size = config.voices.pageSize;
  let query = supabase
    .from('voices')
    .select(columns)
    .order('display_name', { ascending: true })
    .order('id', { ascending: true })
    .limit(size);
  if (cursor) {
    query = query.or(afterKeyset('display_name', cursor.name, cursor.id, 'asc'));
  }
  if (search) {
    query = query.ilike('display_name', `%${escapeLike(search)}%`);
  }
  if (filters.model === 'expressive') {
    const own = Object.values(modelProviders).join(',');
    query = query.not('provider', 'in', `(${own})`);
  } else if (filters.model !== 'all') {
    query = query.eq('provider', modelProviders[filters.model]);
  }
  if (filters.gender) {
    // Stored capitalised ("Female").
    query = query.ilike('gender', filters.gender);
  }
  if (filters.accent !== 'auto') {
    query = query.eq('locale', filters.accent);
  }
  if (filters.language !== 'auto') {
    query = query.ilike('locale', `${filters.language}-%`);
  }

  const { data, error } = await query;
  if (isMissingTable(error)) {
    return { items: [], nextCursor: null };
  }
  const rows = (throwIfError({ data, error }).data ?? []) as VoiceRow[];
  const last = rows[rows.length - 1];
  return {
    items: rows.map(fromRow),
    nextCursor:
      rows.length === size && last
        ? { name: last.display_name, id: last.id }
        : null,
  };
}

export const voicesService = {
  async list(query: VoiceQuery & { cursor: VoiceCursor | null }): Promise<VoicePage> {
    switch (query.source) {
      case 'library':
        return listCatalog(query);
      case 'favorites': {
        const favorites = await voicesService.getFavorites();
        return {
          items: filterLocally(favorites.map(fromFavorite), query),
          nextCursor: null,
        };
      }
      default:
        return {
          items: filterLocally(await ownVoicesService.list(query.source), query),
          nextCursor: null,
        };
    }
  },

  async getFavorites(): Promise<FavoriteVoice[]> {
    const { voices } = await apiRequest<{ voices?: FavoriteVoice[] }>(
      '/api/tts/get-favorite',
    );
    return voices ?? [];
  },

  // Saves the full list after adding one. `isNew` on the very first save.
  async addFavorite(voices: FavoriteVoice[], isNew: boolean): Promise<void> {
    await apiRequest('/api/tts/get-favorite/add-favorite', {
      method: 'POST',
      body: { voices, is_new: isNew },
    });
  },

  // Saves the list that remains after removing one.
  async removeFavorite(remaining: FavoriteVoice[]): Promise<void> {
    await apiRequest('/api/tts/get-favorite/delete', {
      method: 'POST',
      body: { voices: remaining },
    });
  },
};
