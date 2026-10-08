import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, useColors } from '@/theme';

// Dashed dark card that holds upload / record controls on tool screens.
export function MediaPanel({ children }: { children: ReactNode }) {
  return (
    <View className="gap-4 rounded-xl border border-dashed border-night-line bg-night p-4">
      {children}
    </View>
  );
}

type HeaderProps = {
  icon: IconName;
  // Replaces the icon bubble content (e.g. an upload progress ring).
  leading?: ReactNode;
  title: string;
  hint: string;
  // The controls on the right (Upload, Record, Stop, Change).
  action: ReactNode;
};

// Icon bubble, title + hint, and one action.
export function MediaPanelHeader({
  icon,
  leading,
  title,
  hint,
  action,
}: HeaderProps) {
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-3">
      <View className="size-play items-center justify-center rounded-full bg-night-surface">
        {leading ?? (
          <Icon name={icon} size={iconSize.md} color={colors.night.text} />
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <AppText variant="labelSm" numberOfLines={1} className="text-night-text">
          {title}
        </AppText>
        <AppText variant="caption" className="text-night-subtle">
          {hint}
        </AppText>
      </View>
      {action}
    </View>
  );
}
