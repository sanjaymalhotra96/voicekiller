// Route: /trial-offer
// Signup opens this route. Supabase account_type decides whether to offer
// the free trial or send an already-paid account straight to the dashboard.
// "Try for $0.00" swaps it for the 3-day trial paywall, so closing that
// (or buying) lands on the dashboard rather than back here.
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { Button, FormError } from '@/components';
import { useAccountType } from '@/features/subscription/hooks';
import { TrialOfferScreen } from '@/features/subscription/TrialOfferScreen';
import { useColors } from '@/theme';

export default function TrialOfferRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useColors();
  const account = useAccountType();

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

  return <TrialOfferScreen onTry={() => router.replace('/trial-paywall')} />;
}
