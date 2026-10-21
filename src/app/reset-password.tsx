// Route: /reset-password — opened by the Supabase recovery email.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import {
  AppText,
  Banner,
  Button,
  FormError,
  FormTextField,
  ScreenHeader,
  TextLink,
} from '@/components';
import { config } from '@/config';
import { useSession } from '@/features/auth/AuthProvider';
import { useResetPassword } from '@/features/auth/hooks';
import { OtpBadge } from '@/features/auth/OtpBadge';
import {
  resetPasswordSchema,
  ResetPasswordValues,
} from '@/features/auth/schemas';
import { completeOnboarding } from '@/features/onboarding/store';

export default function ResetPasswordScreen() {
  const url = useLinkingURL();
  const router = useRouter();
  const { session } = useSession();
  const { t } = useTranslation();
  const recovery = useResetPassword(url);
  const confirmRef = useRef<TextInput>(null);
  const { control, handleSubmit, reset } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const currentAttempt = recovery.variables?.url === url;
  const done = currentAttempt && recovery.isSuccess;

  // A recovery link goes straight to auth, even on a fresh signed-out launch.
  useEffect(() => completeOnboarding(), []);
  useEffect(() => reset(), [url, done, reset]);

  const submit = handleSubmit(({ password }) => {
    if (recovery.isValidLink && !recovery.isPending && !done) {
      recovery.mutate({ password, url });
    }
  });
  const leave = () => {
    router.replace(
      session
        ? '/(app)/(tabs)'
        : { pathname: '/(auth)', params: { sheet: 'signIn' } },
    );
  };
  const requestLink = () => router.replace('/forgot-password');

  return (
    <View className="gap-4 pb-6">
      <ScreenHeader onBack={leave} />
      <View className="mb-4 mt-8 items-center">
        <OtpBadge />
        <AppText variant="display" className="mt-6 text-center">
          {t('resetPassword.title')}
        </AppText>
        <AppText variant="subtitle" className="mt-2 text-center text-ink">
          {t('resetPassword.subtitle')}
        </AppText>
      </View>

      {done ? (
        <>
          <Banner variant="success" message={t('resetPassword.done')} />
          <Button
            label={t(
              session ? 'resetPassword.continue' : 'forgotPassword.backToLogin',
            )}
            onPress={leave}
          />
        </>
      ) : !recovery.isValidLink ? (
        <Banner message={t('errors.recoveryLinkInvalid')} />
      ) : (
        <>
          <FormTextField
            control={control}
            name="password"
            password
            tone="surface"
            label={t('changePassword.new')}
            placeholder={t('changePassword.newPlaceholder', {
              min: config.auth.minPasswordLength,
            })}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!recovery.isPending}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <FormTextField
            ref={confirmRef}
            control={control}
            name="confirmPassword"
            password
            tone="surface"
            label={t('changePassword.confirm')}
            placeholder={t('changePassword.confirmPlaceholder')}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!recovery.isPending}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <FormError error={currentAttempt ? recovery.error : null} />
          <Button
            className="mt-4"
            label={t('resetPassword.submit')}
            loading={recovery.isPending}
            onPress={submit}
          />
        </>
      )}

      {!done && !session ? (
        <TextLink
          label={t('resetPassword.requestLink')}
          onPress={requestLink}
          className="mt-2 self-center"
        />
      ) : null}
    </View>
  );
}
