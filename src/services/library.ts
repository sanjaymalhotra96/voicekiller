import { config } from '@/config';
import {
  isToolId,
  LibraryCursor,
  LibraryFilter,
  LibraryItem,
  LibraryItemMetadata,
} from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { log } from '@/lib/logger';
import { afterKeyset, escapeLike } from '@/lib/postgrest';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Library API (Supabase table public.library_items).
// Screens use the hooks in features/library/hooks.ts, not this directly.

const TABLE = 'library_items';

export type LibraryPage = {
  items: LibraryItem[];
  nextCursor: LibraryCursor | null;
};

type LibraryQuery = {
  // Last row of the previous page; null for the first page.
  cursor: LibraryCursor | null;
  filter: LibraryFilter;
  search: string;
};

type Row = TableRow<'library_items'>;

export const toLibraryItem = (row: Row): LibraryItem | null =>
  isToolId(row.tool)
    ? {
        id: row.id,
        title: row.title,
        tool: row.tool,
        voiceName: row.voice_name,
        durationSeconds: Number(row.duration_seconds),
        audioUrl: row.audio_url,
        createdAt: new Date(row.created_at),
        metadata: (row.metadata ?? {}) as LibraryItemMetadata,
      }
    : null;

// Rows strictly after the cursor in (created_at desc, id desc) order.
const afterCursor = ({ createdAt, id }: LibraryCursor) =>
  afterKeyset('created_at', createdAt, id, 'desc');

export const libraryService = {
  // Keyset pagination: stable while rows are added or deleted, and uses
  // the (user_id, created_at, id) index at any depth.
  async list({ cursor, filter, search }: LibraryQuery): Promise<LibraryPage> {
    const size = config.library.pageSize;

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(size);
    if (cursor) {
      query = query.or(afterCursor(cursor));
    }
    if (filter !== 'all') {
      query = query.eq('tool', filter);
    }
    if (search) {
      query = query.ilike('title', `%${escapeLike(search)}%`);
    }

    const { data, error } = await query;
    if (isMissingTable(error)) {
      log('storage', 'library_items table missing on the backend');
      return { items: [], nextCursor: null };
    }
    const rows = throwIfError({ data, error }).data ?? [];
    const last = rows[rows.length - 1];

    return {
      items: rows
        .map(toLibraryItem)
        .filter((item): item is LibraryItem => item !== null),
      nextCursor:
        rows.length === size && last
          ? { createdAt: last.created_at, id: last.id }
          : null,
    };
  },

  async rename(id: string, title: string): Promise<void> {
    throwIfError(await supabase.from(TABLE).update({ title }).eq('id', id));
  },

  async remove(id: string): Promise<void> {
    throwIfError(await supabase.from(TABLE).delete().eq('id', id));
  },
};
