import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { config } from '@/config';
import { defaultVoiceFilters, VoiceCursor, VoiceQuery } from '@/domain';
import { afterKeyset } from '@/lib/postgrest';
import { voicesService } from '@/services/voices';

type Result = { data: unknown[] | null; error: { code?: string } | null };
let mockResult: Result;
const mockCalls: [string, unknown[]][] = [];

jest.mock('@/lib/supabase', () => {
  const builder: Record<string, unknown> = {};
  for (const method of [
    'select',
    'order',
    'limit',
    'or',
    'eq',
    'ilike',
    'overrideTypes',
    'upsert',
    'delete',
  ]) {
    builder[method] = (...args: unknown[]) => {
      mockCalls.push([method, args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: Result) => unknown) => resolve(mockResult);
  return {
    supabase: {
      from: (table: string) => {
        mockCalls.push(['from', [table]]);
        return builder;
      },
    },
  };
});

const row = (name: string, extra: Record<string, unknown> = {}) => ({
  id: `id-${name}`,
  owner_id: null,
  name,
  description: 'd',
  provider: 'expressive',
  gender: 'female',
  accent: 'en-US',
  language: 'en',
  source: 'library',
  preview_url: 'https://example.com/a.mp3',
  created_at: '2026-10-01T00:00:00Z',
  voice_favorites: [],
  ...extra,
});

const query = (
  patch: Partial<VoiceQuery & { cursor: VoiceCursor | null }> = {},
): VoiceQuery & { cursor: VoiceCursor | null } => ({
  source: 'library',
  search: '',
  filters: defaultVoiceFilters,
  cursor: null,
  ...patch,
});

beforeEach(() => {
  mockCalls.length = 0;
  mockResult = { data: [], error: null };
});

describe('voicesService.list', () => {
  it('lists one source alphabetically with favourites embedded', async () => {
    await voicesService.list(query());
    expect(mockCalls).toEqual([
      ['from', ['voices']],
      ['select', ['*, voice_favorites(user_id)']],
      ['order', ['name', { ascending: true }]],
      ['order', ['id', { ascending: true }]],
      ['limit', [config.voices.pageSize]],
      ['eq', ['source', 'library']],
      ['overrideTypes', []],
    ]);
  });

  it('uses an inner join and no source filter for favourites', async () => {
    await voicesService.list(query({ source: 'favorites' }));
    expect(mockCalls).toContainEqual([
      'select',
      ['*, voice_favorites!inner(user_id)'],
    ]);
    expect(mockCalls.some(([m, a]) => m === 'eq' && a[0] === 'source')).toBe(false);
  });

  it('applies cursor, search and every filter', async () => {
    await voicesService.list(
      query({
        cursor: { name: 'Al, "x"', id: 'i1' },
        search: 'a_b',
        filters: {
          provider: 'directable',
          gender: 'male',
          accent: 'en-GB',
          language: 'fr',
        },
      }),
    );
    expect(mockCalls).toContainEqual([
      'or',
      [afterKeyset('name', 'Al, "x"', 'i1', 'asc')],
    ]);
    expect(mockCalls).toContainEqual(['ilike', ['name', '%a\\_b%']]);
    expect(mockCalls).toContainEqual(['eq', ['provider', 'directable']]);
    expect(mockCalls).toContainEqual(['eq', ['gender', 'male']]);
    expect(mockCalls).toContainEqual(['eq', ['accent', 'en-GB']]);
    expect(mockCalls).toContainEqual(['eq', ['language', 'fr']]);
  });

  it('maps rows, marks favourites and drops unknown providers', async () => {
    mockResult = {
      data: [
        row('Abby', { voice_favorites: [{ user_id: 'u1' }] }),
        row('Old', { provider: 'retired' }),
      ],
      error: null,
    };
    const page = await voicesService.list(query());
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      name: 'Abby',
      isFavorite: true,
      previewUrl: 'https://example.com/a.mp3',
    });
    expect(page.nextCursor).toBeNull();
  });

  it('returns a cursor after a full page', async () => {
    mockResult = {
      data: Array.from({ length: config.voices.pageSize }, (_, i) =>
        row(`V${String(i).padStart(2, '0')}`),
      ),
      error: null,
    };
    const page = await voicesService.list(query());
    const last = `V${String(config.voices.pageSize - 1).padStart(2, '0')}`;
    expect(page.nextCursor).toEqual({ name: last, id: `id-${last}` });
  });
});

describe('voicesService.setFavorite', () => {
  it('upserts to favourite and deletes to unfavourite', async () => {
    await voicesService.setFavorite('v1', true);
    expect(mockCalls).toContainEqual([
      'upsert',
      [{ voice_id: 'v1' }, { ignoreDuplicates: true }],
    ]);
    mockCalls.length = 0;
    await voicesService.setFavorite('v1', false);
    expect(mockCalls).toContainEqual(['delete', []]);
    expect(mockCalls).toContainEqual(['eq', ['voice_id', 'v1']]);
  });
});
