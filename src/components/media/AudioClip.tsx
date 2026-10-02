import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from 'react';
import { Pressable, View } from 'react-native';
import { ProgressBar } from '@/components/media/ProgressBar';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, palette } from '@/theme';

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
  const player = useAudioPlayer(uri);
  const { playing, currentTime, duration, didJustFinish } =
    useAudioPlayerStatus(player);

  const toggle = () => {
    if (playing) {
      player.pause();
      return;
    }
    // Replay from the start once it has finished.
    if (didJustFinish || (duration > 0 && currentTime >= duration)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? pauseLabel : playLabel}
        hitSlop={layout.hitSlop}
        onPress={toggle}
        className="size-play items-center justify-center rounded-full bg-night-surface active:opacity-70"
      >
        <Icon
          name={playing ? 'pause' : 'play'}
          size={iconSize.md}
          color={palette.primary.DEFAULT}
        />
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
