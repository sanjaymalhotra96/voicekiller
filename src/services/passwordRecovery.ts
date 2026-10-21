import { createClient } from '@supabase/supabase-js';
import { config } from '@/config';
import { callbackParams } from '@/lib/authCallback';
import { AppError, toAppError } from '@/lib/errors';
import { throwIfError } from '@/lib/supabaseResult';

// One in-memory recovery session per opened link. It never replaces the
// app's saved login, and only Supabase determines the account being updated.
export function createPasswordRecoveryService(url: string | null) {
  const params = callbackParams(url ?? '');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const isValidLink =
    url?.split(/[?#]/)[0].replace(/\/$/, '') ===
      config.auth.resetPasswordRedirect &&
    params.get('type') === 'recovery' &&
    !params.has('error') &&
    !!accessToken &&
    !!refreshToken;
  let client: ReturnType<typeof createClient> | undefined;
  let sessionReady = false;

  return {
    isValidLink,
    async resetPassword(password: string) {
      if (!isValidLink || !accessToken || !refreshToken) {
        throw new AppError('recoveryLinkInvalid');
      }
      client ??= createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
          storageKey: 'voicekiller-password-recovery',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      if (!sessionReady) {
        const { data, error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error || !data.session) {
          const appError = toAppError(error);
          throw appError.code === 'network'
            ? appError
            : new AppError('recoveryLinkInvalid');
        }
        sessionReady = true;
      }
      throwIfError(await client.auth.updateUser({ password }));
      // Password is already saved. A failed cleanup must not report that
      // the password change failed or revoke other devices' sessions.
      await client.auth.signOut({ scope: 'local' }).catch(() => {});
      sessionReady = false;
    },
  };
}
