import { AudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from 'react';
import { ProgressRing } from '@/components/media/ProgressRing';

type Props = {
  player: AudioPlayer;
  size: number;
};

// Live ring for the playing row. Subscribes to the player itself, so
// position ticks re-render only this ring, never the list.
export function PlaybackRing({ player, size }: Props) {
  const { currentTime, duration } = useAudioPlayerStatus(player);
  return (
    <ProgressRing size={size} ratio={duration > 0 ? currentTime / duration : 0} />
  );
}
