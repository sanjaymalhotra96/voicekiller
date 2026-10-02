import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import { Button, FormError, FormTextField, TextLink } from '@/components';
import { useSignIn } from '@/features/auth/hooks';
import { signInSchema, SignInValues } from '@/features/auth/schemas';
import { toAppError } from '@/lib/errors';

type Props = {
  onSuccess: (email: string) => void;
  onForgotPassword: (email: string) => void;
};

// Content for the Sign In bottom sheet.
export function SignInForm({ onSuccess, onForgotPassword }: Props) {
  const { t } = useTranslation();
  const signIn = useSignIn();
  const { control, handleSubmit, getValues } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const passwordRef = useRef<TextInput>(null);

  // Wrong email/password: banner on top and both fields outlined in red.
  const credentialsRejected =
    !!signIn.error && toAppError(signIn.error).code === 'invalidCredentials';
  // Editing either field clears the previous request error.
  const clearRequestError = () => signIn.error && signIn.reset();

  const submit = handleSubmit(values =>
    signIn.mutate(values, { onSuccess: () => onSuccess(values.email) }),
  );

  return (
    <View className="gap-4">
      <FormError error={signIn.error} />

      <FormTextField
        control={control}
        name="email"
        icon="mail"
        invalid={credentialsRejected}
        onChange={clearRequestError}
        placeholder={t('signIn.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <FormTextField
        ref={passwordRef}
        control={control}
        name="password"
        password
        icon="lock"
        invalid={credentialsRejected}
        onChange={clearRequestError}
        placeholder={t('signIn.password')}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <TextLink
        label={t('signIn.forgot')}
        onPress={() => onForgotPassword(getValues('email').trim())}
        className="self-end"
      />

      <Button
        className="mt-6"
        label={t('signIn.submit')}
        loading={signIn.isPending}
        onPress={submit}
      />
    </View>
  );
}
