import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/config';
import type {
  LibraryCursor,
  LibraryFilter,
  LibraryItem,
  LibrarySource,
} from '@/domain';
import { librarySources } from '@/domain';
import { AppError, toAppError } from '@/lib/errors';
import { escapeLike } from '@/lib/postgrest';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Library API. Each tool keeps its files in its own table; this reads them
// as one list. Screens use the hooks in features/library/hooks.ts.
//
// The exact column types of these tables are not confirmed, so rows are
// read as plain records and every value is converted on the way in.

type Row = Record<string, unknown>;

type SourceTable = {
  table: string;
  // Column holding the owner's user id (denoise_results spells it `userid`).
  owner: string;
  // Column holding the file name (searched and renamed).
  title: string;
  // Row -> file, or null when the row has no audio yet (still processing).
  toItem: (
    row: Row,
  ) => Omit<LibraryItem, 'id' | 'rowId' | 'tool' | 'createdAt'> | null;
};

const text = (value: unknown) =>
  typeof value === 'string' ? value : value == null ? '' : String(value);
const seconds = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const withAudio = <T extends { audioUrl: string }>(item: T) =>
  item.audioUrl ? item : null;

const sources: Record<LibrarySource, SourceTable> = {
  // AI Speech: Text to Speech output.
  textToSpeech: {
    table: 'generated_files',
    owner: 'user_id',
    title: 'file_name',
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: text(row.display_voice_name) || text(row.voice_name) || null,
        durationSeconds: seconds(row.duration),
        audioUrl: text(row.audio_path),
        metadata: {},
      }),
  },
  voiceChanger: {
    table: 'voice_conversion',
    owner: 'user_id',
    title: 'filename',
    toItem: row =>
      withAudio({
        title: text(row.filename),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.file_url),
        metadata: {},
      }),
  },
  audioClean: {
    table: 'denoise_results',
    owner: 'userid',
    title: 'file_name',
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.url),
        metadata: { enhanced: row.operation === 'denoised_enhanced' },
      }),
  },
  speechToText: {
    table: 'speech_text',
    owner: 'user_id',
    title: 'file_name',
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: seconds(row.duration),
        audioUrl: text(row.file_url),
        metadata: {},
      }),
  },
  // Plays the edited audio when there is one, otherwise the original.
  speechEditor: {
    table: 'transcription',
    owner: 'user_id',
    title: 'file_name',
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.updated_speech) || text(row.media_url),
        metadata: {},
      }),
  },
};

// Postgres: column does not exist (e.g. an optional `filename`).
const MISSING_COLUMN = '42703';

// These tables are read by name at runtime, so use the untyped client.
const db = supabase as unknown as SupabaseClient;

const currentUserId = async () => {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) {
    throw new AppError('unknown', 'not signed in');
  }
  return id;
};

type Fetched = { item: LibraryItem; createdAtRaw: string };

// Newest rows of one table, at or before the cursor time.
async function fetchSource(
  tool: LibrarySource,
  options: {
    userId: string;
    cursor: LibraryCursor | null;
    search: string;
    limit: number;
  },
): Promise<{ rows: Fetched[]; full: boolean }> {
  const source = sources[tool];
  let query = db
    .from(source.table)
    .select('*')
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
  const rows = (throwIfError({ data, error }).data ?? []) as Row[];

  const fetched: Fetched[] = [];
  for (const row of rows) {
    const base = source.toItem(row);
    const createdAtRaw = text(row.created_at);
    if (base && createdAtRaw) {
      const rowId = text(row.id);
      fetched.push({
        createdAtRaw,
        item: {
          ...base,
          id: `${tool}:${rowId}`,
          rowId,
          tool,
          createdAt: new Date(createdAtRaw),
        },
      });
    }
  }
  return { rows: fetched, full: rows.length === options.limit };
}

const newestFirst = (a: Fetched, b: Fetched) =>
  b.item.createdAt.getTime() - a.item.createdAt.getTime() ||
  b.createdAtRaw.localeCompare(a.createdAtRaw) ||
  b.item.id.localeCompare(a.item.id);

export type LibraryPage = {
  items: LibraryItem[];
  nextCursor: LibraryCursor | null;
};

type LibraryQuery = {
  // Where the previous page ended; null for the first page.
  cursor: LibraryCursor | null;
  filter: LibraryFilter;
  search: string;
};

export const libraryService = {
  // One tool, or all of them merged newest first. Each page asks every
  // table for its newest rows at or before the cursor and keeps the newest
  // `pageSize` overall, so the merged order is exact across tables.
  async list({ cursor, filter, search }: LibraryQuery): Promise<LibraryPage> {
    const size = config.library.pageSize;
    const userId = await currentUserId();
    const tools = filter === 'all' ? librarySources : [filter];
    const seen = new Set(cursor?.seen ?? []);
    const limit = size + seen.size;

    const results = await Promise.all(
      tools.map(tool => fetchSource(tool, { userId, cursor, search, limit })),
    );
    const merged = results
      .flatMap(result => result.rows)
      .filter(
        row =>
          !(
            cursor &&
            row.createdAtRaw === cursor.createdAt &&
            seen.has(row.item.id)
          ),
      )
      .sort(newestFirst);

    const page = merged.slice(0, size);
    const last = page[page.length - 1];
    const hasMore =
      merged.length > size || results.some(result => result.full);

    let nextCursor: LibraryCursor | null = null;
    if (hasMore && last) {
      const atLast = page
        .filter(row => row.createdAtRaw === last.createdAtRaw)
        .map(row => row.item.id);
      nextCursor = {
        createdAt: last.createdAtRaw,
        // Still at the same timestamp as before: remember earlier ones too.
        seen:
          cursor?.createdAt === last.createdAtRaw
            ? [...cursor.seen, ...atLast]
            : atLast,
      };
    }
    return { items: page.map(row => row.item), nextCursor };
  },

  async rename(item: Pick<LibraryItem, 'tool' | 'rowId'>, title: string) {
    const source = sources[item.tool];
    const userId = await currentUserId();
    const { error } = await db
      .from(source.table)
      .update({ [source.title]: title })
      .eq('id', item.rowId)
      .eq(source.owner, userId);
    if (error) {
      throw toAppError(error);
    }
  },

  // Removes the record. The audio file itself stays in object storage;
  // cleaning that up belongs to the backend.
  async remove(item: Pick<LibraryItem, 'tool' | 'rowId'>) {
    const source = sources[item.tool];
    const userId = await currentUserId();
    const { error } = await db
      .from(source.table)
      .delete()
      .eq('id', item.rowId)
      .eq(source.owner, userId);
    if (error) {
      throw toAppError(error);
    }
  },
};
