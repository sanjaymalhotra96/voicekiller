import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, layout, useColors } from '@/theme';

type Props = {
  label: string;
  icon: IconName;
  accessibilityLabel?: string;
  // Makes the pill a button ("Guide").
  onPress?: () => void;
};

const BOX =
  'flex-row items-center gap-1.5 rounded-lg border border-success-night-line bg-success-night px-2.5 py-1.5';

// Small green pill in dark headers ("180 min", "Guide").
export function StatusPill({ label, icon, accessibilityLabel, onPress }: Props) {
  const colors = useColors();
  const content = (
    <>
      <Icon name={icon} size={iconSize.sm} color={colors.success.DEFAULT} />
      <AppText variant="caption" className="text-success">
        {label}
      </AppText>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        hitSlop={layout.hitSlop}
        onPress={onPress}
        className={`${BOX} active:opacity-70`}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? label} className={BOX}>
      {content}
    </View>
  );
}
