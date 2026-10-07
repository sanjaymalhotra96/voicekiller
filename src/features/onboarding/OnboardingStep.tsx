import type { ParseKeys } from 'i18next';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { AppText, Icon, TransText } from '@/components';
import { onboardingSteps } from '@/features/onboarding/store';
import { iconSize, palette, shadows } from '@/theme';
import { cn } from '@/utils';

// `canvas`: dark text and orange accents on the warm canvas.
// `primary`: white on the orange screen.
export type OnboardingTone = 'canvas' | 'primary';

const tones = {
  canvas: {
    track: 'bg-line',
    fill: 'bg-primary',
    title: undefined,
    subtitle: 'font-sans text-ink-subtle',
    next: 'bg-primary active:bg-primary-dark',
    nextIcon: palette.surface,
    nextShadow: shadows.fab,
  },
  primary: {
    track: 'bg-surface/30',
    fill: 'bg-surface',
    title: 'text-surface',
    subtitle: 'font-sans-semibold text-primary-ink',
    next: 'bg-surface active:opacity-80',
    nextIcon: palette.primary.dark,
    nextShadow: shadows.fabLight,
  },
} as const;

type Props = {
  // 1-based position, for the progress bar.
  step: number;
  tone?: OnboardingTone;
  // Title may use <brand>…</brand> for the orange highlight.
  titleKey: ParseKeys;
  subtitleKey: ParseKeys;
  onNext: () => void;
  // Content runs edge to edge (marquee rows) instead of the side padding.
  bleed?: boolean;
  children: ReactNode;
};

// Frame shared by every onboarding step: progress bar, title, subtitle,
// the step's own content, and the round Next button at the bottom.
export function OnboardingStep({
  step,
  tone = 'canvas',
  titleKey,
  subtitleKey,
  onNext,
  bleed = false,
  children,
}: Props) {
  const { t } = useTranslation();
  const s = tones[tone];
  return (
    <View className="flex-1 pb-6 pt-4">
      <View className="px-6">
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t('onboarding.step', {
            step,
            total: onboardingSteps,
          })}
          className={cn('h-1 overflow-hidden rounded-full', s.track)}
        >
          <View
            className={cn('h-1 rounded-full', s.fill)}
            style={{ width: `${(step / onboardingSteps) * 100}%` }}
          />
        </View>
        <TransText
          i18nKey={titleKey}
          variant="hero"
          className={cn('mt-7', s.title)}
        />
        <AppText className={cn('mt-2.5 text-lg', s.subtitle)}>
          {t(subtitleKey)}
        </AppText>
      </View>

      <View className={cn('flex-1', !bleed && 'px-6')}>{children}</View>

      <View className="mt-6 items-end px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.next')}
          onPress={onNext}
          style={s.nextShadow}
          className={cn(
            'size-16 items-center justify-center rounded-full',
            s.next,
          )}
        >
          <Icon name="arrowRight" size={iconSize.lg} color={s.nextIcon} />
        </Pressable>
      </View>
    </View>
  );
}
