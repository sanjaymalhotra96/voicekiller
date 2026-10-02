import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText, Button, Icon, ProgressTrack } from '@/components';
import { PlanId, plans } from '@/features/account/plans';
import { iconSize, palette } from '@/theme';

type Props = {
  plan: PlanId;
  usedMinutes: number;
  onUpgrade: () => void;
};

// Minutes used this period. Basic: total + upgrade button.
// Studio: progress bar with minutes remaining.
export function UsageMeter({ plan, usedMinutes, onUpgrade }: Props) {
  const { t } = useTranslation();
  const limit = plans[plan].limitMinutes;
  const used = Math.min(usedMinutes, limit);

  const clock = (
    <View className="size-tile items-center justify-center rounded-full bg-tone-purple-tile">
      <Icon
        name="clock"
        size={iconSize.md}
        color={palette.tone.purple.DEFAULT}
      />
    </View>
  );

  if (plan === 'basic') {
    return (
      <View className="flex-row items-center gap-3">
        {clock}
        <View className="flex-1">
          <AppText variant="caption">{t('plan.usage')}</AppText>
          <AppText variant="stat">
            {used.toFixed(2)}{' '}
            <AppText variant="caption">{t('plan.usageOf', { limit })}</AppText>
          </AppText>
        </View>
        <Button
          size="sm"
          variant="dark"
          icon="gem"
          label={t('plan.buyStudio')}
          onPress={onUpgrade}
        />
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3">
      {clock}
      <View className="flex-1 gap-1">
        <View className="flex-row justify-between">
          <AppText variant="caption">{t('plan.usageThisMonth')}</AppText>
          <AppText variant="caption" className="font-sans-bold text-ink">
            {t('plan.usageMinutes', { used: Math.round(used), limit })}
          </AppText>
        </View>
        <ProgressTrack ratio={limit > 0 ? used / limit : 0} />
        <AppText variant="timestamp">
          {t('plan.remaining', {
            count: Math.max(0, Math.round(limit - used)),
          })}
        </AppText>
      </View>
    </View>
  );
}
