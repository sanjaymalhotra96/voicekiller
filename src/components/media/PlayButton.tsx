import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

const tones = {
  // Light lists: orange with a white play glyph.
  light: {
    idle: 'bg-primary',
    idleIcon: palette.surface,
  },
  // Dark cards: dark disc with an orange play glyph.
  night: {
    idle: 'bg-night-surface',
    idleIcon: palette.primary.DEFAULT,
  },
} as const;

type Props = {
  playing: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: keyof typeof tones;
  // No audio yet.
  disabled?: boolean;
};

// Round play/pause control. While playing it turns white with an orange
// pause glyph, in both tones.
export function PlayButton({
  playing,
  onPress,
  accessibilityLabel,
  tone = 'light',
  disabled = false,
}: Props) {
  const s = tones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: playing }}
      hitSlop={layout.hitSlop}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'size-play items-center justify-center rounded-full active:opacity-70',
        playing ? 'border border-line bg-surface' : s.idle,
        disabled && 'opacity-40',
      )}
    >
      <Icon
        name={playing ? 'pause' : 'play'}
        size={iconSize.md}
        color={playing ? palette.primary.DEFAULT : s.idleIcon}
      />
    </Pressable>
  );
}
