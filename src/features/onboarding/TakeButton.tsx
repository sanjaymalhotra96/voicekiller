import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable } from 'react-native';
import { AppText, Icon, IconName } from '@/components';
import { EqualizerBars } from '@/features/onboarding/EqualizerBars';
import type { TakePhase } from '@/features/onboarding/useGeneratedTake';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

const BAR_HEIGHTS = [14, 20, 11, 17];

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
  // Spoken while playing; defaults to "Stop playback".
  stopLabel?: string;
  disabled?: boolean;
  onPress: () => void;
};

// Onboarding demo button: idle -> loading -> playing (tap to stop).
export function TakeButton({
  phase,
  labels,
  idleIcon,
  stopLabel,
  disabled = false,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const label = labels[phase];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        phase === 'playing' ? stopLabel ?? t('onboarding.stop') : label
      }
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
      {phase === 'idle' ? (
        <Icon name={idleIcon} size={iconSize.md} color={palette.surface} />
      ) : phase === 'loading' ? (
        <ActivityIndicator size="small" color={palette.surface} />
      ) : (
        <EqualizerBars
          heights={BAR_HEIGHTS}
          color={palette.primary.DEFAULT}
          gap={3}
        />
      )}
      <AppText variant="button" numberOfLines={1} className="shrink text-lg">
        {label}
      </AppText>
    </Pressable>
  );
}
