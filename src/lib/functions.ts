import { toAppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

// Calls a Supabase Edge Function with a JSON body and returns its JSON
// response, throwing AppError on failure (see lib/errors for status codes).
export async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error || data === null) {
    throw toAppError(error);
  }
  return data;
}
