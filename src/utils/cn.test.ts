import { describe, expect, it } from '@jest/globals';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('keeps a custom font size next to a colour', () => {
    expect(cn('text-body text-ink')).toBe('text-body text-ink');
  });

  it('lets a later colour replace an earlier one', () => {
    expect(cn('text-body text-ink', 'text-primary')).toBe(
      'text-body text-primary',
    );
  });

  it('lets a later font size replace an earlier one', () => {
    expect(cn('text-body', 'text-heading')).toBe('text-heading');
    expect(cn('text-tag', 'text-sm')).toBe('text-sm');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});
