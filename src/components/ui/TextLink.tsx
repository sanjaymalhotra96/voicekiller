import React from 'react';
import { Pressable } from 'react-native';
import { AppText, TextVariant } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, layout, Palette, useColors } from '@/theme';
import { cn } from '@/utils';

const tones = (c: Palette) =>
  ({
    default: { text: 'text-ink', color: c.ink.DEFAULT },
    accent: { text: 'text-tone-purple', color: c.tone.purple.DEFAULT },
    danger: { text: 'text-danger', color: c.danger.DEFAULT },
  } as const);

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  tone?: keyof ReturnType<typeof tones>;
  variant?: TextVariant;
  className?: string;
  textClassName?: string;
};

// Standalone tappable text ("Forgot password?", "Change", "Delete Account").
// For links inside a sentence use <TransText> with a <link> tag.
export function TextLink({
  label,
  onPress,
  icon,
  tone = 'default',
  variant = 'subtitle',
  className,
  textClassName,
}: Props) {
  const colors = useColors();
  const t = tones(colors)[tone];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={layout.hitSlop}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1.5 active:opacity-60',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={iconSize.sm} color={t.color} /> : null}
      <AppText variant={variant} className={cn(t.text, textClassName)}>
        {label}
      </AppText>
    </Pressable>
  );
}
