import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { icons } from '@/assets';
import { AppText, Avatar } from '@/components';
import { useAccount } from '@/features/account';
import { useCurrentUser } from '@/features/auth';
import { layout, palette } from '@/theme';

// Logo, "Dashboard" + greeting, and the user's avatar.
export function DashboardHeader() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { plan } = useAccount();
  const LogoMark = icons.logoMark;

  return (
    <View className="flex-row items-center gap-2">
      <LogoMark
        width={layout.headerLogo}
        height={layout.headerLogo}
        color={palette.primary.DEFAULT}
      />
      <View className="flex-1">
        <AppText variant="heading" accessibilityRole="header">
          {t('dashboard.title')}
        </AppText>
        <AppText variant="subtitle" className="text-ink">
          {t('dashboard.greeting', { name: user.firstName })}
        </AppText>
      </View>
      <Avatar
        name={user.fullName}
        uri={user.avatarUrl}
        // Only paid plans get a badge ("STUDIO").
        badge={plan === 'studio' ? t('plan.studio') : undefined}
      />
    </View>
  );
}
