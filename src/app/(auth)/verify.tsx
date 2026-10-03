// Route: /verify
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  Button,
  FormError,
  OtpInput,
  ScreenHeader,
  TransText,
  useFieldError,
} from '@/components';
import { config } from '@/config';
import { useResendOtp, useVerifyOtp } from '@/features/auth/hooks';
import { OtpBadge } from '@/features/auth/OtpBadge';
import { otpSchema } from '@/features/auth/schemas';
import { useCountdown } from '@/hooks';
import { formatDuration } from '@/utils';
import { errorMessageKey } from '@/lib/errors';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const fieldError = useFieldError();
  const [code, setCode] = useState('');
  const [validationKey, setValidationKey] = useState<string>();
  const verify = useVerifyOtp();
  const resend = useResendOtp();
  const { remaining, done, restart } = useCountdown(
    config.auth.otpResendSeconds,
  );

  // Wrong-code errors show under the boxes; others (network) below.
  const otpRejected =
    verify.error && errorMessageKey(verify.error) === 'errors.otpInvalid';
  const boxError = validationKey
    ? fieldError(validationKey)
    : otpRejected
    ? t('errors.otpInvalid')
    : undefined;

  const onChange = (value: string) => {
    setCode(value);
    setValidationKey(undefined);
    verify.reset();
  };

  const submit = () => {
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) {
      setValidationKey(parsed.error.issues[0]?.message);
      return;
    }
    // On success Supabase creates a session and RootNavigator shows the tabs.
    verify.mutate({ email, token: code });
  };

  const onResend = () => {
    setCode('');
    setValidationKey(undefined);
    verify.reset();
    resend.mutate(email, { onSuccess: restart });
  };

  return (
    <>
      <ScreenHeader />

      <View className="mt-24 items-center">
        <OtpBadge />

        <AppText variant="display" className="mt-6 text-center">
          {t('verify.title')}
        </AppText>
        <TransText
          i18nKey="verify.subtitle"
          values={{ email }}
          className="mt-2 text-center text-ink"
        />

        <View className="mt-6 w-full">
          <OtpInput
            autoFocus
            value={code}
            onChange={onChange}
            error={boxError}
          />
        </View>

        {done ? (
          <TransText
            i18nKey="verify.resendReady"
            className="mt-8 text-center text-ink"
            onLinkPress={onResend}
            linkClassName="text-link"
          />
        ) : (
          <AppText variant="subtitle" className="mt-8 text-center text-ink">
            {t('verify.resendIn', {
              time: formatDuration(remaining, { padMinutes: true }),
            })}
          </AppText>
        )}
      </View>

      <FormError
        className="mt-4"
        error={otpRejected ? null : verify.error ?? resend.error}
      />

      <Button
        className="mt-8"
        label={t('verify.submit')}
        loading={verify.isPending}
        onPress={submit}
      />
    </>
  );
}
