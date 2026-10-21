import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, Palette, useColors } from '@/theme';
import { cn } from '@/utils';

const tones = (c: Palette) =>
  ({
    // Light lists: orange with a white play glyph.
    light: {
      idle: 'bg-primary',
      idleIcon: c.contrast,
    },
    // Dark cards: dark disc with an orange play glyph.
    night: {
      idle: 'bg-night-surface',
      idleIcon: c.primary.DEFAULT,
    },
  } as const);

type Props = {
  playing: boolean;
  loading?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: keyof ReturnType<typeof tones>;
  // No audio yet.
  disabled?: boolean;
  // Fits the action row of a result card.
  compact?: boolean;
};

// Round play/pause control. While playing it turns white with an orange
// pause glyph, in both tones.
export function PlayButton({
  playing,
  loading = false,
  onPress,
  accessibilityLabel,
  tone = 'light',
  disabled = false,
  compact = false,
}: Props) {
  const colors = useColors();
  const s = tones(colors)[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        disabled: disabled || loading,
        selected: playing,
        busy: loading,
      }}
      hitSlop={layout.hitSlop}
      disabled={disabled || loading}
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-full active:opacity-70',
        compact ? 'size-icon-btn' : 'size-play',
        !compact && (playing ? 'border border-line bg-surface' : s.idle),
        disabled && 'opacity-40',
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={playing ? colors.primary.DEFAULT : s.idleIcon}
        />
      ) : (
        <Icon
          name={playing ? 'pause' : 'play'}
          size={iconSize.md}
          color={playing ? colors.primary.DEFAULT : s.idleIcon}
        />
      )}
    </Pressable>
  );
}
