import React, { forwardRef, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TextInputProps, View } from 'react-native';
import { AppText, textVariants } from '@/components/ui/AppText';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { FieldTone, fieldTones } from '@/components/ui/fieldTones';
import { useColors } from '@/theme';
import { cn } from '@/utils';

type TextAreaProps = Omit<TextInputProps, 'multiline'> & {
  label?: string;
  required?: boolean;
  error?: string;
  // Helper text under the box ("Write the description in English.").
  hint?: string;
  // Shows "490 / 50,000". Needs maxLength. `inside` the box's corner, or
  // `below` it next to the hint.
  showCount?: boolean;
  countPlacement?: 'inside' | 'below';
  // Pinned to the box's bottom-right corner (e.g. an AI wand button).
  accessory?: ReactNode;
  tone?: FieldTone;
  // Box size, e.g. "h-textarea" or "flex-1".
  boxClassName?: string;
  className?: string;
};

// Multi-line input: scripts, descriptions, transcriptions, prompts.
export const TextArea = forwardRef<TextInput, TextAreaProps>(
  function TextAreaInner(
    {
      label,
      required = false,
      error,
      hint,
      showCount = false,
      countPlacement = 'inside',
      accessory,
      tone = 'filled',
      boxClassName,
      className,
      value,
      maxLength,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const colors = useColors();
    const { i18n } = useTranslation();
    const [focused, setFocused] = useState(false);
    // Digit grouping follows the app language ("1,000" / "1.000").
    const formatCount = (n: number) => n.toLocaleString(i18n.language);
    const scheme = fieldTones(colors)[tone];
    const night = tone === 'night';
    const subtle = night ? 'text-night-subtle' : 'text-ink-subtle';
    const count =
      showCount && maxLength
        ? `${formatCount(value?.length ?? 0)} / ${formatCount(maxLength)}`
        : null;

    return (
      <View className={cn('gap-1.5', className)}>
        {label ? (
          <FieldLabel
            label={label}
            required={required}
            tone={night ? 'night' : 'light'}
          />
        ) : null}
        <View
          className={cn(
            'rounded-xl border px-4 pb-3 pt-3.5',
            error ? 'border-danger' : focused ? scheme.focus : scheme.box,
            boxClassName,
          )}
        >
          <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            accessibilityLabel={label ?? rest.placeholder}
            value={value}
            maxLength={maxLength}
            className={cn('flex-1', textVariants.body, scheme.text)}
            placeholderTextColor={scheme.placeholder}
            selectionColor={colors.primary.DEFAULT}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {count && countPlacement === 'inside' ? (
            <AppText variant="caption" className={cn('mt-2 self-end', subtle)}>
              {count}
            </AppText>
          ) : null}
          {accessory ? (
            <View className="absolute bottom-3 right-3">{accessory}</View>
          ) : null}
        </View>
        {hint || (count && countPlacement === 'below') ? (
          <View className="flex-row justify-between gap-3">
            <AppText variant="caption" className={cn('flex-1', subtle)}>
              {hint ?? ''}
            </AppText>
            {count && countPlacement === 'below' ? (
              <AppText variant="caption" className={subtle}>
                {count}
              </AppText>
            ) : null}
          </View>
        ) : null}
        {error ? (
          <AppText variant="caption" className="text-danger">
            {error}
          </AppText>
        ) : null}
      </View>
    );
  },
);
