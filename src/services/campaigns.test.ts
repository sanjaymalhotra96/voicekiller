import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { campaignsService } from '@/services/campaigns';

type Result = { data: unknown; error: { code?: string } | null };
let mockResult: Result;

jest.mock('@/lib/supabase', () => {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'order', 'insert', 'single']) {
    builder[method] = () => builder;
  }
  builder.then = (resolve: (value: Result) => unknown) => resolve(mockResult);
  return { supabase: { from: () => builder } };
});

beforeEach(() => {
  mockResult = { data: [], error: null };
});

describe('campaignsService', () => {
  it('returns the created campaign', async () => {
    mockResult = { data: { id: 'c1', name: 'Vlog' }, error: null };
    await expect(campaignsService.create('Vlog')).resolves.toEqual({
      id: 'c1',
      name: 'Vlog',
    });
  });

  it('reports a duplicate name as campaignExists', async () => {
    mockResult = { data: null, error: { code: '23505' } };
    await expect(campaignsService.create('Vlog')).rejects.toMatchObject({
      code: 'campaignExists',
    });
  });

  it('lists nothing before the migration has run', async () => {
    mockResult = { data: null, error: { code: '42P01' } };
    await expect(campaignsService.list()).resolves.toEqual([]);
  });
});
