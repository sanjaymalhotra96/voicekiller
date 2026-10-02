import React, { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/ui/AppText';
import { config } from '@/config';
import { cn } from '@/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
};

// One hidden TextInput drives the boxes, so paste and SMS autofill work.
// Boxes share the row width (any length fits) up to the `otp` size token.
export function OtpInput({
  value,
  onChange,
  length = config.auth.otpLength,
  error,
  autoFocus = false,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  return (
    <View className="w-full items-center">
      <Pressable
        testID="otp-boxes"
        className="w-full flex-row justify-center gap-2.5"
        onPress={() => inputRef.current?.focus()}
      >
        {digits.map((digit, i) => (
          <View
            key={i}
            accessibilityLabel={t('verify.digit', { index: i + 1 })}
            className={cn(
              'aspect-square max-w-otp flex-1 items-center justify-center rounded-xl border bg-surface',
              error
                ? 'border-danger'
                : digit
                ? 'border-primary'
                : 'border-line-neutral',
            )}
          >
            <AppText variant="otp">{digit}</AppText>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        testID="otp-input"
        value={value}
        onChangeText={text =>
          onChange(text.replace(/\D/g, '').slice(0, length))
        }
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        caretHidden
        className="absolute h-px w-px opacity-0"
      />

      {error ? (
        <AppText variant="caption" className="mt-2 text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
