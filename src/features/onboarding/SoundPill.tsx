import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText, Icon } from '@/components';
import { EqualizerBars } from '@/features/onboarding/EqualizerBars';
import { palette, shadows } from '@/theme';
import { cn } from '@/utils';

const BAR_HEIGHTS = [12, 16, 10];

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
  // Its clip is playing: bars in an orange dot.
  sounding: boolean;
  // Chosen (orange outline and glow); defaults to `sounding`.
  selected?: boolean;
  look?: (typeof pillLooks)[number];
  onPress: (id: string) => void;
  className?: string;
};

// Rounded pill with a play dot and a label, for picking and hearing a
// sound (step 1 samples, step 3 voices).
export const SoundPill = memo(function SoundPillInner({
  id,
  label,
  accessibilityLabel,
  sounding,
  selected = sounding,
  look = pillLooks[0],
  onPress,
  className,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={() => onPress(id)}
      style={selected ? shadows.pillActive : undefined}
      className={cn(
        'h-pill flex-row items-center gap-2.5 rounded-full border-emphasis pl-2 pr-5 active:opacity-80',
        selected ? 'border-primary bg-surface' : look.box,
        className,
      )}
    >
      <View
        className={cn(
          'size-9 items-center justify-center rounded-full',
          sounding ? 'bg-primary' : look.dot,
        )}
      >
        {sounding ? (
          <EqualizerBars heights={BAR_HEIGHTS} color={palette.surface} />
        ) : (
          <Icon name="play" size={14} color={palette.primary.dark} />
        )}
      </View>
      <AppText className="font-sans-semibold text-lg text-ink">{label}</AppText>
    </Pressable>
  );
});
