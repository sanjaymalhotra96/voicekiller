import React from 'react';
import { Pressable } from 'react-native';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

const variants = {
  // White with a border (header back, sheet close).
  outlined: { box: 'border border-line-neutral bg-surface', color: palette.ink.DEFAULT },
  // Icon only (row menus, info).
  ghost: { box: '', color: palette.ink.DEFAULT },
  // Dark editor header and toolbar.
  night: {
    box: 'border border-night-line bg-night-surface',
    color: palette.night.text,
  },
  // Filled dark (add button).
  solid: { box: 'bg-ink', color: palette.surface },
  // Soft grey square (filter button next to search).
  muted: { box: 'border border-line-neutral bg-muted', color: palette.ink.DEFAULT },
} as const;

type IconButtonVariant = keyof typeof variants;

type Props = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  // `circle`: sheet close / add. `square`: header back. `field`: next to a
  // compact field (same height as search).
  shape?: 'circle' | 'square' | 'field';
  variant?: IconButtonVariant;
  // Overrides the variant's icon colour (e.g. red delete, grey info).
  color?: string;
  disabled?: boolean;
  accessibilityState?: { selected?: boolean; checked?: boolean };
  className?: string;
};

const shapes = {
  circle: 'size-icon-btn-sm rounded-full',
  square: 'size-icon-btn rounded-lg',
  field: 'size-field-sm rounded-xl',
} as const;

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  shape = 'square',
  variant = 'outlined',
  color,
  disabled = false,
  accessibilityState,
  className,
}: Props) {
  const v = variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...accessibilityState }}
      hitSlop={layout.hitSlop}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'items-center justify-center active:opacity-60',
        v.box,
        shapes[shape],
        disabled && 'opacity-40',
        className,
      )}
    >
      <Icon
        name={icon}
        size={shape === 'circle' ? iconSize.sm : iconSize.md}
        color={color ?? v.color}
      />
    </Pressable>
  );
}
