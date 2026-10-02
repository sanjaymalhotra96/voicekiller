import { describe, expect, it } from '@jest/globals';
import type { LibraryItem } from '@/domain';
import { toLibraryRows } from '@/features/library/grouping';

const NOW = new Date(2026, 9, 2, 15, 0); // Fri 2 Oct 2026, 15:00 local

const item = (id: string, createdAt: Date): LibraryItem => ({
  id,
  title: id,
  tool: 'textToSpeech',
  voiceName: null,
  durationSeconds: 1,
  audioUrl: 'https://example.com/a.mp3',
  createdAt,
  metadata: {},
});

describe('toLibraryRows', () => {
  it('returns no rows for no items', () => {
    expect(toLibraryRows([], NOW)).toEqual([]);
  });

  it('adds one header before each date group', () => {
    const rows = toLibraryRows(
      [
        item('a', new Date(2026, 9, 2, 9, 0)),
        item('b', new Date(2026, 9, 2, 0, 1)),
        item('c', new Date(2026, 9, 1, 23, 59)),
        item('d', new Date(2026, 8, 28, 12, 0)),
        item('e', new Date(2026, 8, 1, 12, 0)),
      ],
      NOW,
    );
    const labels = rows.map(row =>
      row.type === 'header' ? row.group : row.key,
    );
    expect(labels).toEqual([
      'today',
      'a',
      'b',
      'yesterday',
      'c',
      'thisWeek',
      'd',
      'earlier',
      'e',
    ]);
  });

  it('treats future timestamps as today', () => {
    const rows = toLibraryRows([item('a', new Date(2026, 9, 3))], NOW);
    expect(rows[0]).toMatchObject({ type: 'header', group: 'today' });
  });
});
