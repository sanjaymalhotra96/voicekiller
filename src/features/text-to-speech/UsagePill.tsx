import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusPill } from '@/components';
import { useAccount } from '@/features/account/hooks';
import { plans } from '@/features/account/plans';

// Minutes left this month ("180 min"), green pill on the dark header.
export function UsagePill() {
  const { t } = useTranslation();
  const { plan, usageMinutes, isLoading } = useAccount();
  if (isLoading) {
    return null;
  }
  const remaining = Math.max(
    0,
    Math.floor(plans[plan].limitMinutes - usageMinutes),
  );

  return (
    <StatusPill
      icon="clock"
      label={t('textToSpeech.minutesLeft', { count: remaining })}
      accessibilityLabel={t('textToSpeech.minutesLeftLabel', { count: remaining })}
    />
  );
}
