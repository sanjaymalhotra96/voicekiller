import { describe, expect, it } from '@jest/globals';
import { AuthError } from '@supabase/supabase-js';
import { AppError, errorMessageKey, toAppError } from '@/lib/errors';

describe('toAppError', () => {
  it('keeps app errors as they are', () => {
    const error = new AppError('quotaExceeded');
    expect(toAppError(error)).toBe(error);
  });

  it('maps Supabase auth codes to app codes', () => {
    expect(
      toAppError(new AuthError('bad', 400, 'invalid_credentials')).code,
    ).toBe('invalidCredentials');
    expect(toAppError(new AuthError('taken', 422, 'email_exists')).code).toBe(
      'emailTaken',
    );
    expect(toAppError(new AuthError('odd', 400, 'something_new')).code).toBe(
      'unknown',
    );
  });

  it('reads failed fetches as network errors', () => {
    expect(toAppError(new TypeError('Network request failed')).code).toBe(
      'network',
    );
    expect(toAppError({ message: 'Failed to fetch' }).code).toBe('network');
  });

  it('falls back to unknown and keeps the original for logging', () => {
    const original = new Error('boom');
    const error = toAppError(original);
    expect(error.code).toBe('unknown');
    expect(error.original).toBe(original);
  });

  it('gives the translation key for any thrown value', () => {
    expect(errorMessageKey(new AppError('nothingToRestore'))).toBe(
      'errors.nothingToRestore',
    );
  });
});
