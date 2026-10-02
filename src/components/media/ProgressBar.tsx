import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/utils';
import { formatDuration } from '@/utils/format';

const clamp = (ratio: number) => Math.min(1, Math.max(0, ratio));

export type ProgressTone = 'light' | 'night';

const tracks: Record<ProgressTone, string> = {
  light: 'bg-line-neutral',
  night: 'bg-night-line',
};

type TrackProps = {
  // 0 to 1.
  ratio: number;
  // Dot at the current position (playback scrubber).
  thumb?: boolean;
  tone?: ProgressTone;
};

// Bare progress track; reused by the player and the usage meter.
export function ProgressTrack({ ratio, thumb = false, tone = 'light' }: TrackProps) {
  const percent = `${clamp(ratio) * 100}%` as const;

  return (
    <View className={cn('h-track justify-center rounded-full', tracks[tone])}>
      <View
        className="h-track rounded-full bg-primary"
        style={{ width: percent }}
      />
      {thumb ? (
        <View
          className="absolute size-2 -translate-x-1 rounded-full bg-primary"
          style={{ left: percent }}
        />
      ) : null}
    </View>
  );
}

type Props = {
  current: number;
  total: number;
  tone?: ProgressTone;
  className?: string;
};

// Playback bar with a dot and elapsed / total time.
export function ProgressBar({ current, total, tone = 'light', className }: Props) {
  const timeClass = tone === 'night' ? 'text-night-muted' : undefined;
  return (
    <View
      className={cn('gap-0.5', className)}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: Math.round(total),
        now: Math.round(current),
      }}
    >
      <View className="flex-row justify-between">
        <AppText variant="timestamp" className={timeClass}>
          {formatDuration(current)}
        </AppText>
        <AppText variant="timestamp" className={timeClass}>
          {formatDuration(total)}
        </AppText>
      </View>
      <ProgressTrack
        ratio={total > 0 ? current / total : 0}
        thumb
        tone={tone}
      />
    </View>
  );
}
