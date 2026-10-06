import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import type { SvgIcon } from '@/assets';
import { AppText } from '@/components';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  label: string;
  icon: SvgIcon;
  onPress: () => void;
  // `tile`: square icon-over-label (iOS). `full`: wide icon-beside-label (Android).
  variant?: 'tile' | 'full';
  // Spinner instead of the icon; presses ignored.
  loading?: boolean;
};

export function AuthButton({
  label,
  icon: Icon,
  onPress,
  variant = 'full',
  loading = false,
}: Props) {
  const isTile = variant === 'tile';
  const size = isTile ? iconSize.xl : iconSize.lg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-xl border border-line bg-surface active:opacity-70',
        isTile ? 'aspect-tile flex-1 gap-2' : 'h-control flex-row gap-3',
      )}
    >
      {loading ? (
        <ActivityIndicator
          color={palette.primary.DEFAULT}
          style={{ width: size, height: size }}
        />
      ) : (
        <Icon width={size} height={size} />
      )}
      <AppText variant={isTile ? 'labelSm' : 'label'}>{label}</AppText>
    </Pressable>
  );
}
