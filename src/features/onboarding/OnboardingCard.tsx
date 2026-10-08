import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText, Icon, IconName } from '@/components';
import type { OnboardingTone } from '@/features/onboarding/OnboardingStep';
import { iconSize, Palette, shadows, useColors } from '@/theme';
import { cn } from '@/utils';

// On orange the card floats on a deep shadow; on the canvas it gets a
// hairline and a soft glow instead.
const cards = (c: Palette) =>
  ({
    primary: { box: 'bg-surface', shadow: shadows(c).card },
    canvas: {
      box: 'border border-line-subtle bg-surface',
      shadow: shadows(c).softCard,
    },
  }) as const;

// White card holding a step's demo.
export function OnboardingCard({
  tone,
  className,
  children,
}: {
  // Tone of the screen behind the card.
  tone: OnboardingTone;
  className?: string;
  children: ReactNode;
}) {
  const colors = useColors();
  const s = cards(colors)[tone];
  return (
    <View
      style={s.shadow}
      className={cn('mt-6 rounded-card p-4', s.box, className)}
    >
      {children}
    </View>
  );
}

const labelTones = (c: Palette) =>
  ({
    accent: { text: 'text-primary-deep', icon: c.primary.deep },
    muted: { text: 'text-ink-subtle', icon: c.ink.subtle },
  }) as const;

// Small uppercase label over a field or section inside the card.
export function CardLabel({
  children,
  icon,
  tone = 'accent',
  className,
}: {
  children: string;
  icon?: IconName;
  tone?: keyof ReturnType<typeof labelTones>;
  className?: string;
}) {
  const colors = useColors();
  const s = labelTones(colors)[tone];
  return (
    <View className={cn('flex-row items-center gap-1.5 px-1', className)}>
      {icon ? <Icon name={icon} size={iconSize.xs} color={s.icon} /> : null}
      <AppText
        className={cn(
          'font-sans-bold text-xs uppercase tracking-widest',
          s.text,
        )}
      >
        {children}
      </AppText>
    </View>
  );
}
