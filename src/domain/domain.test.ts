import { describe, expect, it } from '@jest/globals';
import { isPlanId, isToolId, toolIds } from '@/domain';
import { tools } from '@/features/tools';

describe('isToolId', () => {
  it('accepts every catalog tool', () => {
    toolIds.forEach(id => expect(isToolId(id)).toBe(true));
  });

  it('rejects unknown and inherited keys', () => {
    expect(isToolId('nope')).toBe(false);
    expect(isToolId('toString')).toBe(false);
  });

  it('has UI metadata for every tool', () => {
    expect(Object.keys(tools).sort()).toEqual([...toolIds].sort());
  });
});

describe('isPlanId', () => {
  it('accepts known plans only', () => {
    expect(isPlanId('basic')).toBe(true);
    expect(isPlanId('studio')).toBe(true);
    expect(isPlanId('gold')).toBe(false);
    expect(isPlanId(1)).toBe(false);
    expect(isPlanId(null)).toBe(false);
  });
});
