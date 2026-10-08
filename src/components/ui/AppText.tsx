import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/utils';

// Central type scale. Add a variant here instead of repeating classes.
// Sizes are tokens from theme/typography.js (text-body, text-heading, ...).
// TextInput reuses these strings too: className={textVariants.input}.
export const textVariants = {
  display: 'font-sans-bold text-display text-ink',
  hero: 'font-sans-bold text-hero leading-hero tracking-hero text-ink',
  badge: 'font-sans-bold text-badge leading-badge tracking-badge text-ink',
  heading: 'font-sans-bold text-heading leading-8 text-ink',
  title: 'font-sans-bold text-2xl text-ink',
  cardTitle: 'font-sans-medium text-lg text-ink',
  otp: 'font-sans-medium text-2xl text-ink',
  lead: 'font-sans text-body leading-lead text-ink-muted',
  body: 'font-sans text-body leading-6 text-ink-muted',
  label: 'font-sans-medium text-base text-ink',
  input: 'font-sans text-body text-ink',
  fieldLabel: 'font-sans-medium text-sm text-ink',
  listItem: 'font-sans-medium text-base text-ink',
  ribbon: 'font-sans-bold text-tiny uppercase tracking-wide text-contrast',
  stat: 'font-sans-semibold text-lg text-ink',
  subtitle: 'font-sans text-sm text-ink-muted',
  labelSm: 'font-sans-medium text-small text-ink-muted',
  caption: 'font-sans text-xs text-ink-muted',
  tag: 'font-sans-medium text-tag',
  timestamp: 'font-sans text-tiny text-ink-muted',
  chip: 'font-sans text-sm',
  rowTitle: 'font-sans-medium text-body text-ink',
  overline: 'font-sans text-xs uppercase tracking-wide text-ink-faint',
  tab: 'font-sans text-small',
  micro: 'font-sans-bold text-micro uppercase text-contrast',
  button: 'font-sans-semibold text-base text-contrast',
  buttonSm: 'font-sans-semibold text-body text-contrast',
} as const;

export type TextVariant = keyof typeof textVariants;

type Props = TextProps & {
  variant?: TextVariant;
};

export function AppText({ variant = 'body', className, ...rest }: Props) {
  return <Text className={cn(textVariants[variant], className)} {...rest} />;
}
