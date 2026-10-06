import type { LibraryCursor, LibraryItem, LibrarySource } from '@/domain';
import { asText, fileNameFromUrl } from '@/utils';

// Paging for Library: pure functions, no I/O (see libraryPaging.test.ts).
// Every source is read newest first at or before a cursor time; the pages
// are merged here so the order is exact across tables.

type Row = Record<string, unknown>;

export type Fetched = { item: LibraryItem; createdAtRaw: string };

type PageQuery = {
  cursor: LibraryCursor | null;
  search: string;
  limit: number;
};

// The rows a table query would return, from a list an API gave whole:
// newest first, at or before the cursor time, matching the search.
export function pageOf(
  rows: Row[],
  titleColumn: string,
  { cursor, search, limit }: PageQuery,
) {
  const term = search.trim().toLowerCase();
  // As times, not text: the API writes "...Z", the database "...+00:00".
  const time = (row: Row) => Date.parse(asText(row.created_at)) || 0;
  const before = cursor ? Date.parse(cursor.createdAt) : Infinity;
  const matching = rows
    .filter(row => time(row) <= before)
    .filter(
      row => !term || asText(row[titleColumn]).toLowerCase().includes(term),
    )
    .sort((a, b) => time(b) - time(a));
  return { rows: matching.slice(0, limit), full: matching.length > limit };
}

// Rows -> Library files. Rows without audio (still processing) or without
// a date are left out.
export function toFetched<
  T extends Omit<
    LibraryItem,
    'id' | 'rowId' | 'tool' | 'createdAt' | 'fileUrl'
  > & { fileUrl?: string },
>(tool: LibrarySource, rows: Row[], toItem: (row: Row) => T | null): Fetched[] {
  const fetched: Fetched[] = [];
  for (const row of rows) {
    const base = toItem(row);
    const createdAtRaw = asText(row.created_at);
    if (base && createdAtRaw) {
      const rowId = asText(row.id);
      fetched.push({
        createdAtRaw,
        item: {
          ...base,
          // No saved name (e.g. Voice Changer results): use the file's.
          title: base.title || fileNameFromUrl(base.fileUrl ?? base.audioUrl),
          fileUrl: base.fileUrl ?? base.audioUrl,
          id: `${tool}:${rowId}`,
          rowId,
          tool,
          createdAt: new Date(createdAtRaw),
        },
      });
    }
  }
  return fetched;
}

const newestFirst = (a: Fetched, b: Fetched) =>
  b.item.createdAt.getTime() - a.item.createdAt.getTime() ||
  b.createdAtRaw.localeCompare(a.createdAtRaw) ||
  b.item.id.localeCompare(a.item.id);

export type LibraryPage = {
  items: LibraryItem[];
  nextCursor: LibraryCursor | null;
};

// Merges what each source returned into one page of `size`, newest first.
// `full`: the source had more rows than it returned. Files sharing the
// cursor's timestamp that were already shown are skipped (`cursor.seen`).
// A source with no more rows whose files all made it onto this page is
// done: later pages do not query it (`cursor.done`).
export function mergePage(
  results: { tool: LibrarySource; rows: Fetched[]; full: boolean }[],
  cursor: LibraryCursor | null,
  size: number,
): LibraryPage {
  const seen = new Set(cursor?.seen ?? []);
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
  const hasMore = merged.length > size || results.some(result => result.full);

  const shown = new Set(page.map(row => row.item.id));
  const done = [
    ...(cursor?.done ?? []),
    ...results
      .filter(r => !r.full && r.rows.every(row => shown.has(row.item.id)))
      .map(r => r.tool),
  ];

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
      done,
    };
  }
  return { items: page.map(row => row.item), nextCursor };
}
