import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { AppText, IconName } from '@/components';
import { SamplePlaybackIcon } from '@/features/onboarding/SamplePlaybackIcon';
import type { TakePhase } from '@/features/onboarding/useGeneratedTake';
import { iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

const boxes: Record<TakePhase, string> = {
  idle: 'bg-primary active:bg-primary-dark',
  loading: 'bg-primary-dark',
  playing: 'bg-ink active:opacity-80',
};

type Props = {
  phase: TakePhase;
  // Button text for each phase ("Generate", "Generating…", "Playing").
  labels: Record<TakePhase, string>;
  idleIcon: IconName;
  disabled?: boolean;
  onPress: () => void;
};

// Onboarding demo button: idle -> loading -> playing (tap to stop).
export function TakeButton({
  phase,
  labels,
  idleIcon,
  disabled = false,
  onPress,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const label = labels[phase];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={phase === 'playing' ? t('onboarding.stop') : label}
      accessibilityState={{
        disabled: disabled || phase === 'loading',
        busy: phase === 'loading',
      }}
      disabled={disabled || phase === 'loading'}
      onPress={onPress}
      className={cn(
        'mt-3.5 h-button flex-row items-center justify-center gap-2.5 rounded-2xl',
        boxes[phase],
        disabled && 'opacity-50',
      )}
    >
      <SamplePlaybackIcon
        playing={phase === 'playing'}
        loading={phase === 'loading'}
        idleIcon={idleIcon}
        size={iconSize.md}
        color={colors.contrast}
      />
      <AppText
        variant="button"
        numberOfLines={1}
        // On the dark (inverting) pill while playing.
        className={cn('shrink text-lg', phase === 'playing' && 'text-surface')}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
