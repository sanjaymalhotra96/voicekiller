import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components';
import { SamplePlaybackIcon } from '@/features/onboarding/SamplePlaybackIcon';
import { shadows, useColors } from '@/theme';
import { cn } from '@/utils';

// Idle looks, rotated along a row for visual rhythm (step 1).
export const pillLooks = [
  { box: 'border-line bg-surface', dot: 'bg-primary-soft' },
  { box: 'border-primary-soft bg-primary-soft', dot: 'bg-surface' },
  { box: 'border-line bg-surface', dot: 'bg-primary-soft' },
  { box: 'border-field bg-field', dot: 'bg-surface' },
] as const;

type Props = {
  // Passed back to onPress, so one stable handler serves a whole list.
  id: string;
  label: string;
  accessibilityLabel: string;
  // Its clip is playing: a stop icon in an orange dot.
  sounding: boolean;
  loading: boolean;
  look?: (typeof pillLooks)[number];
  onPress: (id: string) => void;
  className?: string;
};

// Rounded pill with a play dot and a label for step 1 samples.
export const SoundPill = memo(function SoundPillInner({
  id,
  label,
  accessibilityLabel,
  sounding,
  loading,
  look = pillLooks[0],
  onPress,
  className,
}: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        selected: sounding,
        busy: loading,
        disabled: loading,
      }}
      disabled={loading}
      onPress={() => onPress(id)}
      style={sounding ? shadows(colors).pillActive : undefined}
      className={cn(
        'h-pill flex-row items-center gap-2.5 rounded-full border-emphasis pl-2 pr-5 active:opacity-80',
        sounding ? 'border-primary bg-surface' : look.box,
        className,
      )}
    >
      <View
        className={cn(
          'size-9 items-center justify-center rounded-full',
          sounding ? 'bg-primary' : look.dot,
        )}
      >
        <SamplePlaybackIcon
          playing={sounding}
          loading={loading}
          size={14}
          color={sounding ? colors.contrast : colors.primary.dark}
        />
      </View>
      <AppText className="font-sans-semibold text-lg text-ink">{label}</AppText>
    </Pressable>
  );
});
