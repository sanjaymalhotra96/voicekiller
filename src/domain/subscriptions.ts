import type { PlanId } from '@/domain/plans';

// Paid tiers sold through RevenueCat. Each is an entitlement with the
// same id in the RevenueCat dashboard, and matches the plan names the web
// API uses. Ordered lowest to highest.
const subscriptionTiers = ['pro', 'pro_max', 'studio', 'studio_max'] as const;
export type SubscriptionTier = (typeof subscriptionTiers)[number];

// The highest tier among the active entitlement ids, or null (free).
export function highestTier(
  activeIds: readonly string[],
): SubscriptionTier | null {
  for (let i = subscriptionTiers.length - 1; i >= 0; i--) {
    if (activeIds.includes(subscriptionTiers[i])) {
      return subscriptionTiers[i];
    }
  }
  return null;
}

// The plan the app shows for a paid tier, or null when the app has no
// display for it yet (then the plan saved on the account is shown).
export function planForTier(tier: SubscriptionTier | null): PlanId | null {
  return tier === 'studio' || tier === 'studio_max' ? 'studio' : null;
}

// "Save N%" on the yearly plan, against twelve monthly payments. Null when
// yearly is not cheaper (or a price is missing).
export function yearlySavingsPercent(
  monthlyPrice: number,
  yearlyPrice: number,
): number | null {
  if (!(monthlyPrice > 0) || !(yearlyPrice > 0)) {
    return null;
  }
  const percent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);
  return percent > 0 ? percent : null;
}

// How long after creating an account its first sign-in can be (time to
// type the email OTP, or the Google/Apple round trip).
const firstSignInWindowMs = 60 * 60_000;

// True when this sign-in is the account's first: Supabase sets
// last_sign_in_at on every sign-in, so for an older account it is far
// past created_at. ISO dates from the Supabase user.
export function isFirstSignIn(
  createdAt: string | undefined,
  lastSignInAt: string | undefined,
): boolean {
  const created = Date.parse(createdAt ?? '');
  const signedIn = Date.parse(lastSignInAt ?? '');
  if (Number.isNaN(created) || Number.isNaN(signedIn)) {
    return false;
  }
  return signedIn - created < firstSignInWindowMs;
}
