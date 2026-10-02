import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText, Icon, IconName } from '@/components';
import { iconSize, toneColor, ToneName } from '@/theme';

type Props = {
  title: string;
  icon: IconName;
  tone: ToneName;
  children: ReactNode;
};

// Titled grey card on the instruction details screen
// ("Script", "Acting Instructions", "Audio Sample").
export function DetailSection({ title, icon, tone, children }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Icon name={icon} size={iconSize.md} color={toneColor(tone)} />
        <AppText variant="label" accessibilityRole="header">
          {title}
        </AppText>
      </View>
      <View className="rounded-xl border border-line-neutral bg-muted px-4 py-4">
        {children}
      </View>
    </View>
  );
}
