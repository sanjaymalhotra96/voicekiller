import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Icon, type IconName } from '@/components';

// Every onboarding playback control uses loading, then a stop icon while playing.
export function SamplePlaybackIcon({
  playing,
  loading,
  color,
  idleIcon = 'play',
  size = 16,
}: {
  playing: boolean;
  loading: boolean;
  color: string;
  idleIcon?: IconName;
  size?: number;
}) {
  return loading ? (
    <ActivityIndicator size="small" color={color} />
  ) : (
    <Icon name={playing ? 'stop' : idleIcon} size={size} color={color} />
  );
}
