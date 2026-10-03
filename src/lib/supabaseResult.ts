import { toAppError } from '@/lib/errors';

// Helpers shared by every file in src/services.

// Throw a Supabase `{ error }` result as AppError; return it otherwise.
export const throwIfError = <T extends { error: unknown }>(result: T): T => {
  if (result.error) {
    throw toAppError(result.error);
  }
  return result;
};

// Postgres / PostgREST codes for a table that doesn't exist yet
// (the backend has not created it yet).
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205']);

export const isMissingTable = (error: { code?: string } | null) =>
  !!error?.code && MISSING_TABLE_CODES.has(error.code);
