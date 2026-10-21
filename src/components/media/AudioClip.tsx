import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { usePlaybackControls } from '@/hooks/usePlaybackControls';
import { ProgressBar } from '@/components/media/ProgressBar';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, useColors } from '@/theme';

type Props = {
  uri: string;
  name: string;
  playLabel: string;
  pauseLabel: string;
};

// One local clip with play/pause, name and progress (a picked or recorded
// voice sample). It owns a player for this file only, which loads the
// duration up front and is released when the clip unmounts.
export function AudioClip({ uri, name, playLabel, pauseLabel }: Props) {
  const colors = useColors();
  const player = useAudioPlayer(uri);
  const { playing, loading, play, pause } = usePlaybackControls(player);
  const { currentTime, duration, didJustFinish } =
    useAudioPlayerStatus(player);

  const toggle = () => {
    if (playing) {
      pause();
      return;
    }
    // Replay from the start once it has finished.
    if (didJustFinish || (duration > 0 && currentTime >= duration)) {
      player.seekTo(0);
    }
    play();
  };

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? pauseLabel : playLabel}
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        hitSlop={layout.hitSlop}
        onPress={toggle}
        className="size-play items-center justify-center rounded-full bg-night-surface active:opacity-70"
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
        ) : (
          <Icon
            name={playing ? 'pause' : 'play'}
            size={iconSize.md}
            color={colors.primary.DEFAULT}
          />
        )}
      </Pressable>
      <View className="flex-1 gap-1">
        <AppText variant="labelSm" numberOfLines={1} className="text-night-text">
          {name}
        </AppText>
        <ProgressBar current={currentTime} total={duration} tone="night" />
      </View>
    </View>
  );
}
