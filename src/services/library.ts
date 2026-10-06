import { config } from '@/config';
import type {
  LibraryCursor,
  LibraryFilter,
  LibraryItem,
  LibrarySource,
} from '@/domain';
import { librarySources } from '@/domain';
import { AppError, toAppError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { escapeLike } from '@/lib/postgrest';
import { supabase, untypedSupabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';
import { Fetched, LibraryPage, mergePage, pageOf, toFetched } from '@/services/libraryPaging';
import { Row, sources } from '@/services/librarySources';

// Library API. Each tool keeps its files in its own table
// (services/librarySources.ts); this reads them as one list, paged by
// services/libraryPaging.ts. Screens use features/library/hooks.ts.

export type { LibraryPage } from '@/services/libraryPaging';

// Postgres: column does not exist (e.g. an optional `filename`).
const MISSING_COLUMN = '42703';

// These tables are read by name at runtime, so use the untyped client.
const db = untypedSupabase;

const currentUserId = async () => {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) {
    throw new AppError('unknown', 'not signed in');
  }
  return id;
};

type SourceQuery = {
  userId: string;
  cursor: LibraryCursor | null;
  search: string;
  limit: number;
};

// Newest rows of one source, at or before the cursor time.
async function fetchSource(
  tool: LibrarySource,
  options: SourceQuery,
): Promise<{ rows: Fetched[]; full: boolean }> {
  const source = sources[tool];
  if (source.list) {
    const all = await source.list(options.userId, options.cursor === null);
    const { rows, full } = pageOf(all, source.title, options);
    return { rows: toFetched(tool, rows, source.toItem), full };
  }
  let query = db
    .from(source.table)
    .select(source.columns)
    .eq(source.owner, options.userId)
    .order('created_at', { ascending: false })
    .limit(options.limit);
  if (options.cursor) {
    query = query.lte('created_at', options.cursor.createdAt);
  }
  if (options.search) {
    query = query.ilike(source.title, `%${escapeLike(options.search)}%`);
  }

  const { data, error } = await query;
  // Table not created yet, or an optional column missing: nothing to show.
  if (isMissingTable(error) || error?.code === MISSING_COLUMN) {
    return { rows: [], full: false };
  }
  const rows = (throwIfError({ data, error }).data ?? []) as unknown as Row[];
  return {
    rows: toFetched(tool, rows, source.toItem),
    full: rows.length === options.limit,
  };
}

type LibraryQuery = {
  // Where the previous page ended; null for the first page.
  cursor: LibraryCursor | null;
  filter: LibraryFilter;
  search: string;
};

export const libraryService = {
  // One tool, or all of them merged newest first.
  async list({ cursor, filter, search }: LibraryQuery): Promise<LibraryPage> {
    const size = config.library.pageSize;
    const userId = await currentUserId();
    // Tables with no more files are skipped after the first page.
    const tools = (filter === 'all' ? librarySources : [filter]).filter(
      tool => !cursor?.done?.includes(tool),
    );
    const limit = size + (cursor?.seen.length ?? 0);
    const results = await Promise.all(
      tools.map(async tool => ({
        tool,
        ...(await fetchSource(tool, { userId, cursor, search, limit })),
      })),
    );
    return mergePage(results, cursor, size);
  },

  async rename(item: Pick<LibraryItem, 'tool' | 'rowId'>, title: string) {
    const source = sources[item.tool];
    const userId = await currentUserId();
    const { data, error } = await db
      .from(source.table)
      .update({ [source.title]: title })
      .eq('id', item.rowId)
      .eq(source.owner, userId)
      .select('id');
    if (error) {
      log('api', `rename in ${source.table} failed`, error);
      throw toAppError(error);
    }
    // No row changed although the file is listed: the database does not
    // let this user update the table (no UPDATE policy).
    if (!data?.length) {
      log('api', `rename in ${source.table} changed no row`, item.rowId);
      throw new AppError('renameNotAllowed');
    }
  },

  // Deletes the record and its stored file through the web API.
  async remove(item: Pick<LibraryItem, 'tool' | 'rowId' | 'fileUrl'>) {
    await sources[item.tool].remove(item);
  },
};
