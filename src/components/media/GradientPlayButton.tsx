import type { AudioPlayer } from 'expo-audio';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { PlaybackRing } from '@/components/media/PlaybackRing';
import { Icon } from '@/components/ui/Icon';
import { control, gradientStyle, iconSize, layout, useColors } from '@/theme';
import { cn } from '@/utils';

// Diameter in dp, from the `play-lg` size token.
const SIZE = parseFloat(control['play-lg']);

type Props = {
  // This button owns the shared player right now.
  active: boolean;
  playing: boolean;
  loading?: boolean;
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
  loading = false,
  player,
  onPress,
  accessibilityLabel,
  disabled = false,
}: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        disabled: disabled || loading,
        selected: active && playing,
        busy: loading,
      }}
      hitSlop={layout.hitSlop}
      disabled={disabled || loading}
      onPress={onPress}
      style={active || disabled ? undefined : gradientStyle(colors, 'play')}
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
      {loading ? (
        <ActivityIndicator
          size="small"
          color={active ? colors.primary.DEFAULT : colors.contrast}
        />
      ) : (
        <Icon
          name={active && playing ? 'pause' : 'play'}
          size={iconSize.md}
          color={active ? colors.primary.DEFAULT : colors.contrast}
        />
      )}
    </Pressable>
  );
}
