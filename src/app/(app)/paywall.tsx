// Route: /paywall (full-screen modal)
// The trial offer (after signup) opens this route. Supabase account_type
// decides whether to show plans or send an already-paid account straight
// to the dashboard.
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Button, FormError } from '@/components';
import { config } from '@/config';
import { yearlySavingsPercent } from '@/domain';
import { plans } from '@/features/account/plans';
import {
  useAccountType,
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
import { useColors } from '@/theme';
import { openLink } from '@/utils';

export default function PaywallRoute() {
  usePaywallOpenFlag();
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const account = useAccountType();
  useStatusBarStyle(account.data === 'free' ? 'light-content' : 'dark-content');

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

  // Back to the dashboard or the screen that opened the paywall.
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

  if (account.isError) {
    return (
      <View className="flex-1 justify-center gap-4 px-5">
        <FormError error={account.error} />
        <Button label={t('crash.retry')} onPress={() => account.refetch()} />
      </View>
    );
  }

  if (account.isPending || account.isFetching) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (account.data !== 'free') {
    return <Redirect href="/" />;
  }

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
