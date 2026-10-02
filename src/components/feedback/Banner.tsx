import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

type Variant = 'error' | 'success';

const variants: Record<
  Variant,
  { box: string; text: string; icon: IconName; color: string }
> = {
  error: {
    box: 'border-danger-line bg-danger-soft',
    text: 'text-danger',
    icon: 'alert',
    color: palette.danger.DEFAULT,
  },
  success: {
    box: 'border-tone-green-line bg-tone-green-soft',
    text: 'text-tone-green',
    icon: 'checkCircle',
    color: palette.tone.green.DEFAULT,
  },
};

type Props = {
  message: string;
  variant?: Variant;
  className?: string;
};

// Inline banner for request results ("Incorrect email or password.").
export function Banner({ message, variant = 'error', className }: Props) {
  const v = variants[variant];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn(
        'flex-row items-center gap-2.5 rounded-xl border px-3.5 py-3',
        v.box,
        className,
      )}
    >
      <Icon name={v.icon} size={iconSize.md} color={v.color} />
      <AppText variant="subtitle" className={cn('flex-1', v.text)}>
        {message}
      </AppText>
    </View>
  );
}
