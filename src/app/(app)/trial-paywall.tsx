// Route: /trial-paywall (full-screen modal)
// The 3-day free trial plans, opened by the trial offer after signup.
// The Unlock Studio paywall (/paywall) stays for upgrades and plan limits.
// Supabase account_type decides whether to show plans or send an
// already-paid account straight to the dashboard.
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Button, FormError } from '@/components';
import { yearlySavingsPercent } from '@/domain';
import {
  useAccountType,
  usePaywallOpenFlag,
  usePurchase,
  useStudioPlans,
} from '@/features/subscription/hooks';
import type { PaywallPlan } from '@/features/subscription/PaywallScreen';
import { TrialPaywallScreen } from '@/features/subscription/TrialPaywallScreen';
import { useStatusBarStyle } from '@/hooks';
import { AppError, errorMessageKey } from '@/lib/errors';
import { useColors } from '@/theme';

export default function TrialPaywallRoute() {
  usePaywallOpenFlag();
  useStatusBarStyle('dark-content');
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const account = useAccountType();

  const studioPlans = useStudioPlans();
  const purchase = usePurchase();

  const yearly = studioPlans.data?.yearly ?? null;
  const monthly = studioPlans.data?.monthly ?? null;
  // The design's own "save 17%" and "$7.50/month" until store prices load.
  const savePercent =
    yearly && monthly
      ? yearlySavingsPercent(monthly.product.price, yearly.product.price)
      : undefined;
  const yearlyPerMonth = yearly
    ? yearly.product.pricePerMonthString
    : undefined;

  // To the dashboard (the trial offer replaced itself with this screen).
  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/');

  const onStart = async (choice: PaywallPlan) => {
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
      // An alert, so the screen itself stays exactly as designed.
      Alert.alert(t(errorMessageKey(error)));
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
    <TrialPaywallScreen
      yearlyPrice={yearly?.product.priceString}
      monthlyPrice={monthly?.product.priceString}
      yearlyPerMonth={yearlyPerMonth}
      savePercent={savePercent}
      busy={purchase.isPending}
      onLater={close}
      onStart={onStart}
    />
  );
}
