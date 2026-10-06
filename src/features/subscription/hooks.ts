import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { queryKeys } from '@/lib/queryKeys';
import { purchasesReady } from '@/lib/purchases';
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

// After a purchase the plan and its minutes change on the server too.
const useRefreshAfterPurchase = () => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: key }),
      client.invalidateQueries({ queryKey: queryKeys.account.all }),
    ]);
};

// Upgrade: the paywall when free, the store's manage page when subscribed.
export function useUpgrade() {
  const subscription = useSubscription();
  const refresh = useRefreshAfterPurchase();
  return useMutation({
    mutationFn: async () => {
      const manageUrl = subscription.data?.manageUrl;
      if (manageUrl) {
        await openLink(manageUrl);
        return false;
      }
      return subscriptionService.openPaywall();
    },
    onSuccess: changed => (changed ? refresh() : undefined),
  });
}

