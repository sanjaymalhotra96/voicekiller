import type { LibraryItem } from '@/features/library/types';

export type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

// Flat rows for a FlatList: a header before each date group.
export type LibraryRow =
  | { type: 'header'; key: string; group: DateGroup }
  | { type: 'item'; key: string; item: LibraryItem };

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

function dateGroup(date: Date, now = new Date()): DateGroup {
  const days = Math.floor((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < WEEK_DAYS) return 'thisWeek';
  return 'earlier';
}

// Items must already be sorted newest first. `maxPerGroup` keeps only
// the newest few files of each date group (the All tab overview).
export function toLibraryRows(
  items: LibraryItem[],
  maxPerGroup = Infinity,
  now = new Date(),
) {
  const rows: LibraryRow[] = [];
  let current: DateGroup | null = null;
  let inGroup = 0;
  for (const item of items) {
    const group = dateGroup(item.createdAt, now);
    if (group !== current) {
      rows.push({ type: 'header', key: `header-${group}`, group });
      current = group;
      inGroup = 0;
    }
    if (inGroup < maxPerGroup) {
      rows.push({ type: 'item', key: item.id, item });
      inGroup += 1;
    }
  }
  return rows;
}
