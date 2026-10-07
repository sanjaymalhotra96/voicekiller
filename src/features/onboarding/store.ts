import { useSyncExternalStore } from 'react';

// Number of onboarding screens, for the progress bar.
export const onboardingSteps = 8;

// Onboarding plays every time the app starts signed out. Within one run of
// the app it is done once the user finishes it, or once anyone has been
// signed in (signing out then goes to Welcome, not back to onboarding).
// Kept in memory on purpose: closing the app resets it, so the next
// signed-out launch shows onboarding again.
let done = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getDone = () => done;

// Re-renders the root stack when it flips, so finishing onboarding opens
// the Welcome screen.
export function useOnboardingCompleted() {
  return useSyncExternalStore(subscribe, getDone, getDone);
}

export function completeOnboarding() {
  if (done) {
    return;
  }
  done = true;
  listeners.forEach(listener => listener());
}
