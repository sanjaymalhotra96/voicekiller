import { config } from '@/config';

// Deep links before Expo Router opens them. Google sign-in comes back to
// voicekiller://auth-callback, which the in-app browser already handled
// (services/auth.ts); if the system also delivers it, open the app's start
// instead of a "not found" screen.
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  // The reset screen reads the original URL with useLinkingURL. Keep
  // tokens out of the router's path and search parameters.
  if (
    path.split(/[?#]/)[0].replace(/\/$/, '') ===
    config.auth.resetPasswordRedirect
  ) {
    return '/reset-password';
  }
  return path.includes('auth-callback') ? '/' : path;
}
