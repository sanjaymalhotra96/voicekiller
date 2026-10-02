import type { AudioPlayer } from 'expo-audio';
import React from 'react';
import { Pressable, View } from 'react-native';
import { PlaybackRing } from '@/components/media/PlaybackRing';
import { Icon } from '@/components/ui/Icon';
import { control, gradientStyle, iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

// Diameter in dp, from the `play-lg` size token.
const SIZE = parseFloat(control['play-lg']);

type Props = {
  // This button owns the shared player right now.
  active: boolean;
  playing: boolean;
  // Shared player; only the active button draws its progress ring.
  player: AudioPlayer;
  onPress: () => void;
  accessibilityLabel: string;
  // No audio to play (e.g. sample not uploaded yet).
  disabled?: boolean;
};

// Round sample player for voice and instruction rows: gradient with a play
// glyph; while active, white with an orange pause and a progress ring.
export function GradientPlayButton({
  active,
  playing,
  player,
  onPress,
  accessibilityLabel,
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: active && playing }}
      hitSlop={layout.hitSlop}
      disabled={disabled}
      onPress={onPress}
      style={active || disabled ? undefined : gradientStyle('play')}
      className={cn(
        'size-play-lg items-center justify-center overflow-hidden rounded-full active:opacity-80',
        active ? 'bg-surface' : 'bg-ai',
        disabled && 'bg-line-neutral',
      )}
    >
      {active ? (
        <View className="absolute inset-0">
          <PlaybackRing player={player} size={SIZE} />
        </View>
      ) : null}
      <Icon
        name={active && playing ? 'pause' : 'play'}
        size={iconSize.md}
        color={active ? palette.primary.DEFAULT : palette.surface}
      />
    </Pressable>
  );
}
