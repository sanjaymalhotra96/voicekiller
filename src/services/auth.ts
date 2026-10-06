import { openAuthSessionAsync } from 'expo-web-browser';
import { config } from '@/config';
import { AppError } from '@/lib/errors';
import { throwIfError } from '@/lib/supabaseResult';
import { supabase } from '@/lib/supabase';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

// Every auth call the app makes. Screens use the hooks in
// features/auth/hooks.ts, never this object directly.
type AuthService = {
  signUp(input: SignUpInput): Promise<void>;
  signIn(input: SignInInput): Promise<void>;
  signOut(): Promise<void>;
  verifyOtp(email: string, token: string): Promise<void>;
  resendOtp(email: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  // False when the user closed the Google page without signing in.
  signInWithGoogle(): Promise<boolean>;
};

// The values Supabase puts on the way back, in the query (?code=) or the
// fragment (#access_token=...), depending on the auth flow.
function callbackParams(url: string) {
  const params = new URLSearchParams();
  for (const part of [url.split('?')[1]?.split('#')[0], url.split('#')[1]]) {
    new URLSearchParams(part ?? '').forEach((value, key) =>
      params.set(key, value),
    );
  }
  return params;
}

export const authService: AuthService = {
  async signUp({ fullName, email, password }) {
    throwIfError(
      await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      }),
    );
  },
  async signIn({ email, password }) {
    throwIfError(await supabase.auth.signInWithPassword({ email, password }));
  },
  async signOut() {
    throwIfError(await supabase.auth.signOut());
  },
  async verifyOtp(email, token) {
    throwIfError(
      await supabase.auth.verifyOtp({ email, token, type: 'signup' }),
    );
  },
  async resendOtp(email) {
    throwIfError(await supabase.auth.resend({ email, type: 'signup' }));
  },
  // Opens Google's sign-in page (Supabase OAuth) in a secure in-app
  // browser; Google sends the user back to config.auth.oauthRedirect with
  // a code or tokens, which become the session. AuthProvider then sees
  // the new session and the app opens.
  async signInWithGoogle() {
    const redirectTo = config.auth.oauthRedirect;
    const { data } = throwIfError(
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      }),
    );
    if (!data.url) {
      throw new AppError('googleSignInFailed', 'no OAuth URL');
    }
    const result = await openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') {
      return false;
    }
    const params = callbackParams(result.url);
    const code = params.get('code');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (code) {
      throwIfError(await supabase.auth.exchangeCodeForSession(code));
    } else if (accessToken && refreshToken) {
      throwIfError(
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      );
    } else {
      throw new AppError('googleSignInFailed', params.get('error_description'));
    }
    return true;
  },
  async sendPasswordReset(email) {
    throwIfError(
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: config.auth.resetPasswordRedirect,
      }),
    );
  },
};
