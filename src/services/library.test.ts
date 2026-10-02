import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { config } from '@/config';
import { AppError } from '@/lib/errors';
import { escapeLike, pgQuote } from '@/lib/postgrest';
import { afterCursor, libraryService } from '@/services/library';

// A chainable fake of supabase.from(): records every call and resolves
// with `result` when awaited.
type Result = { data: unknown[] | null; error: { code?: string } | null };
let mockResult: Result;
const mockCalls: [string, unknown[]][] = [];

jest.mock('@/lib/logger', () => ({ log: () => {} }));

jest.mock('@/lib/supabase', () => {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'order', 'limit', 'or', 'eq', 'ilike']) {
    builder[method] = (...args: unknown[]) => {
      mockCalls.push([method, args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: Result) => unknown) => resolve(mockResult);
  return { supabase: { from: () => builder } };
});

const row = (id: string, createdAt: string, tool = 'textToSpeech') => ({
  id,
  user_id: 'u1',
  title: `Title ${id}`,
  tool,
  voice_name: null,
  duration_seconds: '12.5',
  audio_url: `https://example.com/${id}.mp3`,
  created_at: createdAt,
});

const fullPage = (lastCreatedAt: string) =>
  Array.from({ length: config.library.pageSize }, (_, i) =>
    row(`r${i}`, i === config.library.pageSize - 1 ? lastCreatedAt : 'x'),
  );

beforeEach(() => {
  mockCalls.length = 0;
  mockResult = { data: [], error: null };
});

describe('libraryService.list', () => {
  it('orders by created_at then id and applies no cursor on page one', async () => {
    await libraryService.list({ cursor: null, filter: 'all', search: '' });
    expect(mockCalls).toEqual([
      ['select', ['*']],
      ['order', ['created_at', { ascending: false }]],
      ['order', ['id', { ascending: false }]],
      ['limit', [config.library.pageSize]],
    ]);
  });

  it('applies cursor, filter and escaped search', async () => {
    const cursor = { createdAt: '2026-10-01T10:00:00.123456+00:00', id: 'abc' };
    await libraryService.list({
      cursor,
      filter: 'voiceClone',
      search: '50%_off',
    });
    expect(mockCalls).toContainEqual(['or', [afterCursor(cursor)]]);
    expect(mockCalls).toContainEqual(['eq', ['tool', 'voiceClone']]);
    expect(mockCalls).toContainEqual(['ilike', ['title', '%50\\%\\_off%']]);
  });

  it('returns the raw timestamp of the last row as the next cursor', async () => {
    const precise = '2026-10-01T10:00:00.123456+00:00';
    mockResult = { data: fullPage(precise), error: null };
    const page = await libraryService.list({
      cursor: null,
      filter: 'all',
      search: '',
    });
    expect(page.nextCursor).toEqual({
      createdAt: precise,
      id: `r${config.library.pageSize - 1}`,
    });
  });

  it('stops paging on a short page', async () => {
    mockResult = { data: [row('a', '2026-10-01T10:00:00Z')], error: null };
    const page = await libraryService.list({
      cursor: null,
      filter: 'all',
      search: '',
    });
    expect(page.nextCursor).toBeNull();
    expect(page.items[0]).toMatchObject({
      id: 'a',
      durationSeconds: 12.5,
      createdAt: new Date('2026-10-01T10:00:00Z'),
    });
  });

  it('drops rows from unknown tools', async () => {
    mockResult = {
      data: [row('a', '2026-10-01T10:00:00Z', 'retiredTool')],
      error: null,
    };
    const page = await libraryService.list({
      cursor: null,
      filter: 'all',
      search: '',
    });
    expect(page.items).toEqual([]);
  });

  it('returns an empty library before the migration has run', async () => {
    mockResult = { data: null, error: { code: 'PGRST205' } };
    await expect(
      libraryService.list({ cursor: null, filter: 'all', search: '' }),
    ).resolves.toEqual({ items: [], nextCursor: null });
  });

  it('throws other errors as AppError', async () => {
    mockResult = { data: null, error: { code: '500' } };
    await expect(
      libraryService.list({ cursor: null, filter: 'all', search: '' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe('escapeLike', () => {
  it('escapes LIKE wildcards and backslashes', () => {
    expect(escapeLike('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });
});

describe('pgQuote', () => {
  it('escapes quotes and backslashes inside the quotes', () => {
    expect(pgQuote('say "hi"')).toBe('"say \\"hi\\""');
    expect(pgQuote('a\\b')).toBe('"a\\\\b"');
    expect(pgQuote('a,b.(c)')).toBe('"a,b.(c)"');
  });
});

describe('afterCursor', () => {
  it('quotes values so PostgREST reads them as literals', () => {
    expect(afterCursor({ createdAt: 'T', id: 'I' })).toBe(
      'created_at.lt."T",and(created_at.eq."T",id.lt."I")',
    );
  });
});
