import Purchases, { CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { highestTier, SubscriptionTier } from '@/domain';
import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { purchasesReady } from '@/lib/purchases';

// In-app subscriptions through RevenueCat. Screens use
// features/subscription/hooks.ts.
//
// The paywall is RevenueCat's own (designed in the RevenueCat dashboard,
// Paywalls), showing the current offering, with Restore purchases built
// in. Entitlement ids must match domain/subscriptions.ts.

export type Subscription = {
  tier: SubscriptionTier | null;
  // Store page where the user manages or cancels; null when free.
  manageUrl: string | null;
};

const free: Subscription = { tier: null, manageUrl: null };

export const toSubscription = (info: CustomerInfo): Subscription => {
  const tier = highestTier(Object.keys(info.entitlements.active));
  return { tier, manageUrl: tier ? info.managementURL : null };
};

const ensureReady = () => {
  if (!purchasesReady()) {
    throw new AppError('purchasesUnavailable');
  }
};

export const subscriptionService = {
  // Free until purchases are set up.
  async get(): Promise<Subscription> {
    if (!purchasesReady()) {
      return free;
    }
    return toSubscription(await Purchases.getCustomerInfo());
  },

  // Shows the paywall. True when the user bought or restored a plan.
  async openPaywall(): Promise<boolean> {
    ensureReady();
    const result = await RevenueCatUI.presentPaywall({ displayCloseButton: true });
    if (result === PAYWALL_RESULT.ERROR) {
      log('purchases', 'paywall error');
      throw new AppError('purchaseFailed');
    }
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  },
};
