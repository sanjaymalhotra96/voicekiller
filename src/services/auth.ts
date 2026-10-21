import type { User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  CryptoDigestAlgorithm,
  digestStringAsync,
  randomUUID,
} from 'expo-crypto';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Platform } from 'react-native';
import { config } from '@/config';
import { callbackParams } from '@/lib/authCallback';
import { AppError } from '@/lib/errors';
import { requestMetaTrackingPermission, trackSignup } from '@/lib/meta';
import { throwIfError } from '@/lib/supabaseResult';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/services/profile';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

async function completeRegistration(
  user: User | null,
  method: 'email' | 'google' | 'apple',
) {
  const created = await profileService.createIfMissing(user);
  if (created && user) {
    void trackSignup(user.id, method);
  }
}

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
  // iOS only. False when the user dismissed the Apple sheet.
  signInWithApple(): Promise<boolean>;
};

export const authService: AuthService = {
  async signUp({ fullName, email, password }) {
    await requestMetaTrackingPermission();
    const { data } = throwIfError(
      await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      }),
    );
    // With email confirmation enabled, wait for verifyOtp's session so
    // the insert runs as the authenticated user under the existing RLS.
    if (data.session) {
      await completeRegistration(data.user, 'email');
    }
  },
  async signIn({ email, password }) {
    throwIfError(await supabase.auth.signInWithPassword({ email, password }));
  },
  async signOut() {
    throwIfError(await supabase.auth.signOut());
  },
  async verifyOtp(email, token) {
    const { data } = throwIfError(
      await supabase.auth.verifyOtp({ email, token, type: 'signup' }),
    );
    await completeRegistration(data.user, 'email');
  },
  async resendOtp(email) {
    throwIfError(await supabase.auth.resend({ email, type: 'signup' }));
  },
  // Opens Google's sign-in page (Supabase OAuth) in a secure in-app
  // browser; Google sends the user back to config.auth.oauthRedirect with
  // a code or tokens, which become the session. AuthProvider then sees
  // the new session and the app opens.
  async signInWithGoogle() {
    await requestMetaTrackingPermission();
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
    let user: User | null;
    if (code) {
      user = throwIfError(
        await supabase.auth.exchangeCodeForSession(code),
      ).data.user;
    } else if (accessToken && refreshToken) {
      user = throwIfError(
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      ).data.user;
    } else {
      throw new AppError('googleSignInFailed', params.get('error_description'));
    }
    await completeRegistration(user, 'google');
    return true;
  },
  // Native Sign in with Apple (iOS). Apple's sheet returns an identity
  // token, which Supabase verifies and turns into a session; no browser.
  // A nonce ties that token to this request: Apple gets its SHA-256, and
  // Supabase gets the raw value to check against it.
  async signInWithApple() {
    if (Platform.OS !== 'ios') {
      throw new AppError('appleSignInFailed', 'iOS only');
    }
    await requestMetaTrackingPermission();
    const nonce = randomUUID();
    const hashedNonce = await digestStringAsync(
      CryptoDigestAlgorithm.SHA256,
      nonce,
    );
    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
        return false;
      }
      throw new AppError('appleSignInFailed', error);
    }
    if (!credential.identityToken) {
      throw new AppError('appleSignInFailed', 'no identity token');
    }
    const { data } = throwIfError(
      await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce,
      }),
    );
    let user = data.user;
    // Apple shares the name only on the very first sign-in and never puts
    // it in the token, so save it now (same field as email sign-up).
    const fullName = [
      credential.fullName?.givenName,
      credential.fullName?.familyName,
    ]
      .filter(Boolean)
      .join(' ');
    if (fullName) {
      user = throwIfError(
        await supabase.auth.updateUser({ data: { full_name: fullName } }),
      ).data.user;
    }
    await completeRegistration(user, 'apple');
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
