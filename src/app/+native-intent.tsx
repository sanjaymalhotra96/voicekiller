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
  return path.includes('auth-callback') ? '/' : path;
}
