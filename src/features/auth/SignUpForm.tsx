import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import {
  TransText,
  Button,
  FormCheckbox,
  FormError,
  FormTextField,
} from '@/components';
import { useSignUp } from '@/features/auth/hooks';
import { signUpSchema, SignUpValues } from '@/features/auth/schemas';

type Props = {
  onSuccess: (email: string) => void;
  onOpenTerms?: () => void;
};

// Content for the Sign Up bottom sheet.
export function SignUpForm({ onSuccess, onOpenTerms }: Props) {
  const { t } = useTranslation();
  const signUp = useSignUp();
  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreed: false,
    },
  });

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const submit = handleSubmit(({ fullName, email, password }) =>
    signUp.mutate(
      { fullName, email, password },
      { onSuccess: () => onSuccess(email) },
    ),
  );

  return (
    <View className="gap-4">
      <FormTextField
        control={control}
        name="fullName"
        icon="user"
        placeholder={t('signUp.fullName')}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <FormTextField
        ref={emailRef}
        control={control}
        name="email"
        icon="mail"
        placeholder={t('signUp.email')}
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
        placeholder={t('signUp.password')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <FormTextField
        ref={confirmRef}
        control={control}
        name="confirmPassword"
        password
        icon="lock"
        placeholder={t('signUp.confirmPassword')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <View className="mt-3">
        <FormCheckbox control={control} name="agreed">
          <TransText
            i18nKey="signUp.agree"
            className="text-ink"
            onLinkPress={onOpenTerms}
            linkClassName="underline"
          />
        </FormCheckbox>
      </View>

      <FormError error={signUp.error} />

      <Button
        className="mt-6"
        label={t('signUp.submit')}
        loading={signUp.isPending}
        onPress={submit}
      />
    </View>
  );
}
