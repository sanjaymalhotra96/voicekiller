// Route: /paywall (full-screen modal)
// Unlock Studio. Opens by itself once after sign-up (Dashboard), and from
// Settings > Manage Subscription / Upgrade while the user is free.
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { config } from '@/config';
import { yearlySavingsPercent } from '@/domain';
import { plans } from '@/features/account/plans';
import {
  usePaywallOpenFlag,
  usePurchase,
  useRestorePurchases,
  useStudioPlans,
} from '@/features/subscription/hooks';
import {
  PaywallPlan,
  PaywallScreen,
} from '@/features/subscription/PaywallScreen';
import { useStatusBarStyle } from '@/hooks';
import { AppError, errorMessageKey } from '@/lib/errors';
import { openLink } from '@/utils';

export default function PaywallRoute() {
  useStatusBarStyle('light-content');
  usePaywallOpenFlag();
  const { t } = useTranslation();
  const router = useRouter();
  const studioPlans = useStudioPlans();
  const purchase = usePurchase();
  const restore = useRestorePurchases();

  const yearly = studioPlans.data?.yearly ?? null;
  const monthly = studioPlans.data?.monthly ?? null;
  // The design's own "Save 17%" until store prices load.
  const savePercent =
    yearly && monthly
      ? yearlySavingsPercent(monthly.product.price, yearly.product.price)
      : undefined;

  // Errors as an alert, so the screen itself stays exactly as designed.
  const showError = (error: unknown) => Alert.alert(t(errorMessageKey(error)));

  // Back to whatever opened it (Dashboard after sign-up, or Settings).
  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/');

  const onContinue = async (choice: PaywallPlan) => {
    try {
      // Prices not loaded yet (or failed): try once more before buying.
      const loaded =
        studioPlans.data ??
        (await studioPlans.refetch({ throwOnError: true })).data;
      const pack = loaded?.[choice];
      if (!pack) {
        throw new AppError('purchasesUnavailable');
      }
      if (await purchase.mutateAsync(pack)) {
        close();
      }
    } catch (error) {
      showError(error);
    }
  };

  return (
    <PaywallScreen
      yearlyPrice={yearly?.product.priceString}
      monthlyPrice={monthly?.product.priceString}
      savePercent={savePercent}
      minutesPerMonth={plans.studio.limitMinutes}
      busy={purchase.isPending || restore.isPending}
      onClose={close}
      onContinue={onContinue}
      onRestore={() =>
        restore.mutate(undefined, { onSuccess: close, onError: showError })
      }
      onTerms={() => {
        if (config.links.terms) {
          openLink(config.links.terms);
        }
      }}
      onPrivacy={() => {
        if (config.links.privacyPolicy) {
          openLink(config.links.privacyPolicy);
        }
      }}
    />
  );
}
