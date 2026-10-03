import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { GradientName, gradientStyle, iconSize, palette } from '@/theme';
import { cn } from '@/utils';

type VariantStyle = {
  box: string;
  text: string;
  color: string;
  // Drawn over the box background (theme/gradients.ts).
  gradient?: GradientName;
};

// Colour schemes. Add one here to use it everywhere.
const variants = {
  primary: {
    box: 'bg-primary active:bg-primary-dark',
    text: 'text-surface',
    color: palette.surface,
  },
  // Log out: pink background, red text.
  dangerSoft: {
    box: 'bg-danger-soft active:opacity-70',
    text: 'font-sans text-danger',
    color: palette.danger.DEFAULT,
  },
  // Destructive confirm (Delete account).
  danger: {
    box: 'bg-danger active:opacity-80',
    text: 'text-surface',
    color: palette.surface,
  },
  // Secondary choice (Discard).
  neutral: {
    box: 'bg-field active:opacity-70',
    text: 'text-ink-subtle',
    color: palette.ink.subtle,
  },
  // Dark pill (Buy Studio).
  dark: {
    box: 'bg-ink active:opacity-80',
    text: 'text-surface',
    color: palette.surface,
  },
  // Secondary action on the dark editor (Preview).
  night: {
    box: 'border border-night-line bg-night-surface active:opacity-80',
    text: 'text-night-text',
    color: palette.night.text,
  },
  // Peach button on dark panels (Change file).
  soft: {
    box: 'bg-primary-soft active:opacity-80',
    text: 'text-primary',
    color: palette.primary.DEFAULT,
  },
  // Orange outline on white (Generate Audio).
  outline: {
    box: 'border border-primary bg-transparent active:bg-primary-wash',
    text: 'text-primary',
    color: palette.primary.DEFAULT,
  },
  // White button on dark panels (Upload, Record).
  light: {
    box: 'bg-surface active:opacity-80',
    text: 'text-ink',
    color: palette.ink.DEFAULT,
  },
  // Outlined secondary action on dark (Record Again).
  nightOutline: {
    box: 'border border-night-text bg-transparent active:opacity-70',
    text: 'text-night-text',
    color: palette.night.text,
  },
  // AI actions (Generate Instructions): orange-to-purple gradient.
  ai: {
    box: 'overflow-hidden bg-ai active:opacity-90',
    text: 'text-surface',
    color: palette.surface,
    gradient: 'ai',
  },
} as const satisfies Record<string, VariantStyle>;

export type ButtonVariant = keyof typeof variants;

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  // `md`: full-width form button. `sm`: compact, sized to its content.
  size?: 'md' | 'sm';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  className,
}: Props) {
  const inactive = disabled || loading;
  const isSmall = size === 'sm';
  const v: VariantStyle = variants[variant];
  const iconPx = isSmall ? iconSize.sm : iconSize.md;
  const iconColor = disabled ? palette.ink.subtle : v.color;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={v.gradient && !disabled ? gradientStyle(v.gradient) : undefined}
      className={cn(
        'flex-row items-center justify-center gap-2',
        isSmall ? 'h-button-sm rounded-lg px-3.5' : 'h-button rounded-xl',
        // Disabled buttons turn grey (e.g. Delete until "DELETE" is typed).
        disabled ? 'bg-line-neutral' : v.box,
        loading && 'opacity-60',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={v.color} />
      ) : (
        <>
          {icon ? (
            <Icon name={icon} size={iconPx} color={iconColor} />
          ) : null}
          <AppText
            variant={isSmall ? 'buttonSm' : 'button'}
            className={disabled ? 'text-ink-subtle' : v.text}
          >
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
