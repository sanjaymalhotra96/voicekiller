// Which top-level route group the app opens on (src/app/_layout.tsx).
// Exactly one is true at any time; when the inputs change (sign in, sign
// out, onboarding finished) the root stack switches group by itself.
export type EntryGroups = {
  onboarding: boolean;
  auth: boolean;
  app: boolean;
};

export function entryGroups(
  signedIn: boolean,
  onboarded: boolean,
): EntryGroups {
  return {
    // First launch: the intro, before any sign-in screen.
    onboarding: !signedIn && !onboarded,
    auth: !signedIn && onboarded,
    // A signed-in user never sees onboarding, even on a fresh install.
    app: signedIn,
  };
}
