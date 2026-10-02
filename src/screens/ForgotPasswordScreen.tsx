import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  Button,
  FormError,
  FormTextField,
  ScreenHeader,
  TextLink,
  TransText,
} from '@/components';
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
  OtpBadge,
  useSendPasswordReset,
} from '@/features/auth';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { t } = useTranslation();
  const sendReset = useSendPasswordReset();
  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: params.email ?? '' },
  });

  const submit = handleSubmit(({ email }) => sendReset.mutate(email));
  const backToLogin = () =>
    router.dismissTo({ pathname: '/', params: { sheet: 'signIn' } });

  return (
    <>
      <ScreenHeader />

      <View className="mt-8 items-center">
        <OtpBadge glyph="help" />

        <AppText variant="display" className="mt-6 text-center">
          {t('forgotPassword.title')}
        </AppText>
        <AppText variant="subtitle" className="mt-2 px-6 text-center text-ink">
          {t('forgotPassword.subtitle')}
        </AppText>
      </View>

      <View className="mt-6">
        <FormTextField
          control={control}
          name="email"
          tone="surface"
          icon="mail"
          placeholder={t('forgotPassword.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={submit}
          onChange={() => sendReset.reset()}
        />
      </View>

      {sendReset.isSuccess ? (
        <TransText
          i18nKey="forgotPassword.sent"
          values={{ email: sendReset.variables }}
          className="mt-3 text-center text-ink"
        />
      ) : null}

      <FormError className="mt-3" error={sendReset.error} />

      <Button
        className="mt-8"
        label={t('forgotPassword.submit')}
        loading={sendReset.isPending}
        onPress={submit}
      />

      <TextLink
        label={t('forgotPassword.backToLogin')}
        onPress={backToLogin}
        className="mt-6 self-center"
        textClassName="font-sans-medium"
      />
    </>
  );
}
