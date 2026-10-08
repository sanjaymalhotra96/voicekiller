import Purchases, {
  CustomerInfo,
  PurchasesError,
  PurchasesPackage,
} from 'react-native-purchases';
import { highestTier, SubscriptionTier } from '@/domain';
import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { purchasesReady } from '@/lib/purchases';

// In-app subscriptions through RevenueCat. Screens use
// features/subscription/hooks.ts.
//
// The paywall is the app's own screen (app/(app)/paywall.tsx). It sells
// the current offering's Yearly and Monthly packages, so prices come from
// the store. Entitlement ids must match domain/subscriptions.ts.

export type Subscription = {
  tier: SubscriptionTier | null;
  // Store page where the user manages or cancels; null when free.
  manageUrl: string | null;
};

// The packages the paywall offers (RevenueCat > Offerings > current, with
// the Annual and Monthly package types). Either may be missing.
export type StudioPlans = {
  yearly: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
};

const free: Subscription = { tier: null, manageUrl: null };

export const toSubscription = (info: CustomerInfo): Subscription => {
  const tier = highestTier(Object.keys(info.entitlements.active));
  return { tier, manageUrl: tier ? info.managementURL : null };
};

// RevenueCat errors carry the store's reason; log it in full (dev only).
const logStoreError = (message: string, error: unknown) => {
  const e = error as Partial<PurchasesError> | undefined;
  log('purchases', message, {
    code: e?.userInfo?.readableErrorCode ?? e?.code,
    message: e?.message,
    underlying: e?.underlyingErrorMessage,
  });
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

  async getPlans(): Promise<StudioPlans> {
    ensureReady();
    let offerings;
    try {
      offerings = await Purchases.getOfferings();
    } catch (error) {
      // Usually store setup: products not active in Play Console / App
      // Store Connect, or not attached to the offering in RevenueCat.
      logStoreError('could not load offerings', error);
      throw new AppError('purchasesUnavailable', error);
    }
    const offering = offerings.current;
    // The Annual / Monthly package types first; otherwise any package
    // whose product renews yearly / monthly (custom package types).
    const byPeriod = (period: string) =>
      offering?.availablePackages.find(
        pack => pack.product.subscriptionPeriod === period,
      ) ?? null;
    const yearly = offering?.annual ?? byPeriod('P1Y');
    const monthly = offering?.monthly ?? byPeriod('P1M');
    log('purchases', 'current offering', {
      offering: offering?.identifier ?? null,
      packages: offering?.availablePackages.map(pack => ({
        id: pack.identifier,
        type: pack.packageType,
        product: pack.product.identifier,
        period: pack.product.subscriptionPeriod,
      })),
    });
    if (!yearly && !monthly) {
      log(
        'purchases',
        offering
          ? 'current offering has no yearly or monthly package'
          : 'no current offering: mark one as Current in RevenueCat > Offerings',
      );
      throw new AppError('purchasesUnavailable');
    }
    return { yearly, monthly };
  },

  // True when bought; false when the user cancelled the store sheet.
  async purchase(pack: PurchasesPackage): Promise<boolean> {
    ensureReady();
    try {
      await Purchases.purchasePackage(pack);
      return true;
    } catch (error) {
      if ((error as { userCancelled?: boolean }).userCancelled) {
        return false;
      }
      logStoreError('purchase failed', error);
      throw new AppError('purchaseFailed', error);
    }
  },

  // Brings back a plan bought earlier with this store account. Throws
  // nothingToRestore when there is none.
  async restore(): Promise<void> {
    ensureReady();
    let info;
    try {
      info = await Purchases.restorePurchases();
    } catch (error) {
      logStoreError('restore failed', error);
      throw new AppError('purchaseFailed', error);
    }
    if (!toSubscription(info).tier) {
      throw new AppError('nothingToRestore');
    }
  },
};
