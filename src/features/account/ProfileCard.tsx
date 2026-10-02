import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText, Avatar, Ribbon } from '@/components';
import { useAccount } from '@/features/account/hooks';
import { plans } from '@/features/account/plans';
import { UsageMeter } from '@/features/account/UsageMeter';
import { useCurrentUser } from '@/features/auth';

type Props = {
  onUpgrade: () => void;
};

// Settings header card: avatar, name, email, plan ribbon and usage.
export function ProfileCard({ onUpgrade }: Props) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const account = useAccount();

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      <View className="flex-row items-center gap-3 p-4">
        <Avatar name={user.fullName} uri={user.avatarUrl} />
        <View className="flex-1 pr-10">
          <AppText variant="label" numberOfLines={1}>
            {user.fullName}
          </AppText>
          <AppText variant="caption" numberOfLines={1}>
            {user.email}
          </AppText>
        </View>
      </View>
      <View className="mx-4 border-t border-line-neutral py-3">
        <UsageMeter
          plan={account.plan}
          usedMinutes={account.usageMinutes}
          onUpgrade={onUpgrade}
        />
      </View>
      <Ribbon
        label={t(`plan.${account.plan}`)}
        colorClassName={plans[account.plan].ribbon}
      />
    </View>
  );
}
