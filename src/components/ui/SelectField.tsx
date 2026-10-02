import React from 'react';
import { Pressable } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { FieldTone, fieldTones } from '@/components/ui/fieldTones';
import { Icon } from '@/components/ui/Icon';
import { iconSize } from '@/theme';
import { cn } from '@/utils';

type Props = {
  // Current value; when empty the placeholder is shown greyed out.
  value?: string;
  placeholder: string;
  onPress: () => void;
  // Screen reader name of the field ("Accent").
  accessibilityLabel: string;
  tone?: FieldTone;
  size?: 'md' | 'sm';
  // `forward` opens a screen or sheet; `down` a dropdown-style list.
  chevron?: 'forward' | 'down';
  className?: string;
};

// Tappable field that opens a picker ("Accent  >", "Campaign  >").
export function SelectField({
  value,
  placeholder,
  onPress,
  accessibilityLabel,
  tone = 'muted',
  size = 'md',
  chevron = 'forward',
  className,
}: Props) {
  const scheme = fieldTones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={value ? { text: value } : undefined}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between gap-2 rounded-xl border px-4 active:opacity-70',
        size === 'sm' ? 'h-field-sm' : 'h-control',
        scheme.box,
        className,
      )}
    >
      <AppText
        variant={value ? 'label' : 'body'}
        numberOfLines={1}
        className={cn('flex-shrink', value ? scheme.text : undefined)}
        style={value ? undefined : { color: scheme.placeholder }}
      >
        {value || placeholder}
      </AppText>
      <Icon
        name={chevron === 'down' ? 'chevronDown' : 'chevronRight'}
        size={iconSize.sm}
        color={scheme.icon}
      />
    </Pressable>
  );
}
