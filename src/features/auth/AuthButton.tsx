import React from 'react';
import { Pressable } from 'react-native';
import type { SvgIcon } from '@/assets';
import { AppText } from '@/components';
import { iconSize } from '@/theme';
import { cn } from '@/utils';

type Props = {
  label: string;
  icon: SvgIcon;
  onPress: () => void;
  // `tile`: square icon-over-label (iOS). `full`: wide icon-beside-label (Android).
  variant?: 'tile' | 'full';
};

export function AuthButton({
  label,
  icon: Icon,
  onPress,
  variant = 'full',
}: Props) {
  const isTile = variant === 'tile';
  const size = isTile ? iconSize.xl : iconSize.lg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-xl border border-line bg-surface active:opacity-70',
        isTile ? 'aspect-tile flex-1 gap-2' : 'h-control flex-row gap-3',
      )}
    >
      <Icon width={size} height={size} />
      <AppText variant={isTile ? 'labelSm' : 'label'}>{label}</AppText>
    </Pressable>
  );
}
