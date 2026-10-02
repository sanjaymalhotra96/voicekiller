import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { AppText, Badge, Icon, IconName } from '@/components';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  // Omit for an icon-only chip (settings gear).
  label?: string;
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  // `accent`: orange-tinted (the selected voice).
  tone?: 'default' | 'accent';
  // Shows a chevron after the label (opens a picker).
  chevron?: boolean;
  // Small badge over the top edge ("Beta").
  badge?: string;
};

// Dark rounded control in the editor toolbar.
export const ToolbarChip = memo(function ToolbarChipInner({
  label,
  icon,
  onPress,
  accessibilityLabel,
  tone = 'default',
  chevron = false,
  badge,
}: Props) {
  const accent = tone === 'accent';
  const color = accent ? palette.primary.DEFAULT : palette.night.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'h-tool-chip flex-row items-center gap-1.5 rounded-lg border active:opacity-70',
        label ? 'px-2.5' : 'w-tool-chip justify-center',
        accent
          ? 'border-primary-night-line bg-primary-night'
          : 'border-night-line bg-night-surface',
      )}
    >
      {icon ? (
        <Icon name={icon} size={iconSize.sm} color={color} />
      ) : null}
      {label ? (
        <AppText
          variant="labelSm"
          numberOfLines={1}
          className="max-w-24 text-night-text"
        >
          {label}
        </AppText>
      ) : null}
      {chevron ? (
        <Icon name="chevronRight" size={iconSize.xs} color={color} />
      ) : null}
      {badge ? (
        <Badge label={badge} className="absolute -top-2 right-1" />
      ) : null}
    </Pressable>
  );
});
