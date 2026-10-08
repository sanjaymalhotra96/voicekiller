import React, { forwardRef, ReactNode, useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, textVariants } from '@/components/ui/AppText';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { FieldTone, fieldTones } from '@/components/ui/fieldTones';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, layout, useColors } from '@/theme';
import { cn } from '@/utils';

export type TextFieldProps = TextInputProps & {
  // Label above the field ("Your Full Name").
  label?: string;
  // Red asterisk before the label.
  required?: boolean;
  // Leading icon inside the field.
  icon?: IconName;
  // Right-side content: copy button, lock, "Change" link...
  trailing?: ReactNode;
  error?: string;
  // Red border without a message (e.g. both fields on wrong credentials).
  invalid?: boolean;
  // Shows an eye toggle and hides the text.
  password?: boolean;
  // Colour scheme, see fieldTones.ts.
  tone?: FieldTone;
  // `md`: form field. `sm`: compact (search, file name).
  size?: 'md' | 'sm';
  className?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextFieldInner(
    {
      label,
      required = false,
      icon,
      trailing,
      error,
      invalid = false,
      password = false,
      tone = 'filled',
      size = 'md',
      className,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const colors = useColors();
    const { t } = useTranslation();
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(password);
    const scheme = fieldTones(colors)[tone];

    const hasError = !!error || invalid;
    const accent = hasError
      ? colors.danger.DEFAULT
      : focused
      ? colors.primary.DEFAULT
      : scheme.icon;

    return (
      <View className={cn('gap-1.5', className)}>
        {label ? (
          <FieldLabel
            label={label}
            required={required}
            tone={tone === 'night' ? 'night' : 'light'}
          />
        ) : null}
        <View
          className={cn(
            'flex-row items-center gap-3 rounded-xl border px-4',
            size === 'sm' ? 'h-field-sm' : 'h-control',
            focused ? scheme.focus : scheme.box,
            hasError && 'border-danger',
          )}
        >
          {icon ? <Icon name={icon} size={iconSize.md} color={accent} /> : null}
          <TextInput
            ref={ref}
            accessibilityLabel={label ?? rest.placeholder}
            className={cn('h-full flex-1', textVariants.input, scheme.text)}
            placeholderTextColor={scheme.placeholder}
            selectionColor={colors.primary.DEFAULT}
            secureTextEntry={hidden}
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
          {password && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                hidden ? t('signUp.showPassword') : t('signUp.hidePassword')
              }
              hitSlop={layout.hitSlop}
              onPress={() => setHidden(h => !h)}
            >
              <Icon
                name={hidden ? 'eye' : 'eyeOff'}
                size={iconSize.md}
                color={scheme.icon}
              />
            </Pressable>
          )}
          {trailing}
        </View>
        {error ? (
          <AppText variant="caption" className="text-danger">
            {error}
          </AppText>
        ) : null}
      </View>
    );
  },
);
