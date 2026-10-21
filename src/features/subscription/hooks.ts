import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { planForTier } from '@/domain';
import { useSession } from '@/features/auth/AuthProvider';
import { AppErrorCode, toAppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { purchasesReady } from '@/lib/purchases';
import { profileService } from '@/services/profile';
import {
  Subscription,
  subscriptionService,
  toSubscription,
} from '@/services/subscription';
import { openLink } from '@/utils';

const key = queryKeys.subscription.all;

// The user's paid tier, kept current: RevenueCat reports renewals,
// expiries and purchases made elsewhere while the app is open.
function useSubscription() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: subscriptionService.get });

  useEffect(() => {
    if (!purchasesReady()) {
      return;
    }
    const update = (info: CustomerInfo) =>
      client.setQueryData<Subscription>(key, toSubscription(info));
    Purchases.addCustomerInfoUpdateListener(update);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(update);
    };
  }, [client]);

  return query;
}

// The user's paid tier from RevenueCat, or null (free, or not set up).
export const useSubscriptionTier = () => useSubscription().data?.tier ?? null;

// Supabase account_type ('free' or a paid type), fetched fresh each time
// a screen opens: the trial offer and paywall use it to decide whether an
// already-paid account skips straight to the dashboard.
export function useAccountType() {
  const userId = useSession().session?.user.id;
  return useQuery({
    queryKey: [...queryKeys.account.all, 'type', userId],
    queryFn: () => profileService.getAccountType(userId as string),
    enabled: !!userId,
    staleTime: 0,
  });
}

// After a purchase the plan and its minutes change on the server too.
const useRefreshAfterPurchase = () => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: key }),
      client.invalidateQueries({ queryKey: queryKeys.account.all }),
    ]);
};

// The Yearly and Monthly packages with store prices, for the paywall.
export const useStudioPlans = () =>
  useQuery({
    queryKey: queryKeys.studioPlans,
    queryFn: subscriptionService.getPlans,
    // Refresh on reopening so dashboard changes do not stay cached all session.
    staleTime: 0,
  });

// Buys a package. Resolves true when bought, false when cancelled.
export function usePurchase() {
  const refresh = useRefreshAfterPurchase();
  return useMutation({
    mutationFn: subscriptionService.purchase,
    onSuccess: bought => (bought ? refresh() : undefined),
  });
}

export function useRestorePurchases() {
  const refresh = useRefreshAfterPurchase();
  return useMutation({
    mutationFn: subscriptionService.restore,
    onSuccess: refresh,
  });
}

// Manage Subscription and Upgrade: the paywall when free, the store's
// manage page when subscribed.
export function useOpenSubscription() {
  const router = useRouter();
  const manageUrl = useSubscription().data?.manageUrl;
  return () => {
    if (manageUrl) {
      openLink(manageUrl);
    } else {
      router.push('/paywall');
    }
  };
}

// Errors a plan fixes: out of minutes, or a Studio / paid-only feature.
const upgradeCodes = new Set<AppErrorCode>([
  'quotaExceeded',
  'studioRequired',
  'paidPlanRequired',
]);

// The paywall marks itself open, so a second failure while it shows (or
// two at once) does not stack another one on top.
let paywallOpen = false;

export function usePaywallOpenFlag() {
  useEffect(() => {
    paywallOpen = true;
    return () => {
      paywallOpen = false;
    };
  }, []);
}

// Opens the paywall whenever an action fails because of the plan, e.g.
// POST /api/denoise -> 400 "Your account limit has been reached". The
// screen keeps showing the error under it. Not for Studio subscribers:
// there is nothing higher to buy, so they only see the message.
export function useUpgradeOnPlanLimit() {
  const router = useRouter();
  const client = useQueryClient();
  const onStudio = planForTier(useSubscriptionTier()) === 'studio';
  const onStudioRef = useRef(onStudio);
  onStudioRef.current = onStudio;

  useEffect(
    () =>
      client.getMutationCache().subscribe(event => {
        if (
          event.type !== 'updated' ||
          event.action.type !== 'error' ||
          !upgradeCodes.has(toAppError(event.action.error).code) ||
          onStudioRef.current ||
          paywallOpen
        ) {
          return;
        }
        paywallOpen = true;
        router.push('/paywall');
      }),
    [client, router],
  );
}
