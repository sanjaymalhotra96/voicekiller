import { AudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from 'react';
import { ProgressBar, ProgressTone } from '@/components/media/ProgressBar';

type Props = {
  player: AudioPlayer;
  // Used until the player knows the real length.
  fallbackDuration: number;
  tone?: ProgressTone;
};

// Live position for the playing row. It subscribes to the player itself,
// so position ticks re-render only this bar, not the list.
export function PlaybackProgress({
  player,
  fallbackDuration,
  tone,
}: Props) {
  const { currentTime, duration } = useAudioPlayerStatus(player);

  return (
    <ProgressBar
      current={currentTime}
      total={duration > 0 ? duration : fallbackDuration}
      tone={tone}
    />
  );
}
