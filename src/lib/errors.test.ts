import { describe, expect, it } from '@jest/globals';
import {
  AuthApiError,
  AuthRetryableFetchError,
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import { AppError, errorMessageKey, toAppError } from '@/lib/errors';

describe('toAppError', () => {
  it('passes AppError through unchanged', () => {
    const error = new AppError('uploadFailed');
    expect(toAppError(error)).toBe(error);
  });

  it('maps Supabase auth codes', () => {
    const error = new AuthApiError('bad', 400, 'invalid_credentials');
    expect(toAppError(error).code).toBe('invalidCredentials');
    expect(toAppError(error).original).toBe(error);
  });

  it('maps unknown auth codes to unknown', () => {
    expect(toAppError(new AuthApiError('x', 400, 'something_new')).code).toBe(
      'unknown',
    );
  });

  it('treats retryable fetch errors and TypeErrors as network', () => {
    expect(toAppError(new AuthRetryableFetchError('x', 0)).code).toBe(
      'network',
    );
    expect(toAppError(new TypeError('Network request failed')).code).toBe(
      'network',
    );
  });

  it('detects network failures in plain database errors', () => {
    expect(toAppError({ message: 'TypeError: fetch failed' }).code).toBe(
      'network',
    );
    expect(toAppError({ message: 'duplicate key' }).code).toBe('unknown');
    expect(toAppError(null).code).toBe('unknown');
  });

  it('builds the i18n key', () => {
    const error = new AuthApiError('x', 429, 'over_request_rate_limit');
    expect(errorMessageKey(error)).toBe('errors.rateLimited');
  });
});

describe('Edge Function errors', () => {
  const http = (status: number) => new FunctionsHttpError({ status });

  it.each([
    [402, 'quotaExceeded'],
    [429, 'rateLimited'],
    [404, 'serviceUnavailable'],
    [503, 'serviceUnavailable'],
    [400, 'unknown'],
  ])('HTTP %p -> %p', (status, code) => {
    expect(toAppError(http(status)).code).toBe(code);
  });

  it('maps fetch and relay failures', () => {
    expect(toAppError(new FunctionsFetchError({})).code).toBe('network');
    expect(toAppError(new FunctionsRelayError({})).code).toBe(
      'serviceUnavailable',
    );
  });
});
