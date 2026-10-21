import type { ParseKeys } from 'i18next';
import React, { ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Keyboard, Pressable, View } from 'react-native';
import { AppText, Icon, TransText } from '@/components';
import { useOnboardingReveal } from '@/features/onboarding/OnboardingPager';
import { onboardingSteps } from '@/features/onboarding/store';
import { iconSize, Palette, shadows, useColors } from '@/theme';
import { cn } from '@/utils';

// `canvas`: dark text and orange accents on the warm canvas.
// `primary`: white on the orange screen.
export type OnboardingTone = 'canvas' | 'primary';

const tones = (c: Palette) =>
  ({
    canvas: {
      track: 'bg-line',
      fill: 'bg-primary',
      title: undefined,
      subtitle: 'font-sans text-ink-subtle',
      next: 'bg-primary active:bg-primary-dark',
      nextIcon: c.contrast,
      nextShadow: shadows(c).fab,
    },
    primary: {
      track: 'bg-contrast/30',
      fill: 'bg-contrast',
      title: 'text-contrast',
      subtitle: 'font-sans-semibold text-primary-ink',
      next: 'bg-contrast active:opacity-80',
      nextIcon: c.primary.dark,
      nextShadow: shadows(c).fabLight,
    },
  } as const);

type Props = {
  // 1-based position, for the progress bar.
  step: number;
  tone?: OnboardingTone;
  // Title may use <brand>…</brand> for the orange highlight.
  titleKey: ParseKeys;
  subtitleKey: ParseKeys;
  // Runs the step's cleanup, then calls `go` with the next route's name to
  // leave through the circle transition.
  onNext: (go: (name: string) => void) => void;
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
  const colors = useColors();
  const s = tones(colors)[tone];
  const button = useRef<View>(null);
  const reveal = useOnboardingReveal();
  const next = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    button.current?.measureInWindow((x, y, w, h) => {
      const origin = { x: x + w / 2, y: y + h / 2 };
      // Canvas steps grow the orange in from the button; orange steps
      // shrink it back into the button.
      const mode = tone === 'primary' ? 'collapse' : 'expand';
      onNext(name => reveal(name, origin, mode));
    });
  };
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
          ref={button}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.next')}
          onPress={next}
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
