import type { PlanId } from '@/domain/plans';

// Paid tiers sold through RevenueCat. Each is an entitlement with the
// same id in the RevenueCat dashboard, and matches the plan names the web
// API uses. Ordered lowest to highest.
const subscriptionTiers = ['pro', 'pro_max', 'studio', 'studio_max'] as const;
export type SubscriptionTier = (typeof subscriptionTiers)[number];

// The highest tier among the active entitlement ids, or null (free).
export function highestTier(activeIds: readonly string[]): SubscriptionTier | null {
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
