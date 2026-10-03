// Route: /change-password
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import {
  Banner,
  Button,
  FormError,
  FormTextField,
  ScreenHeader,
} from '@/components';
import { config } from '@/config';
import { useChangePassword } from '@/features/account/hooks';
import { changePasswordSchema, ChangePasswordValues } from '@/features/account/schemas';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const { control, handleSubmit, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: '', next: '', confirm: '' },
  });
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const submit = handleSubmit(({ current, next }) =>
    changePassword.mutate({ current, next }, { onSuccess: () => reset() }),
  );

  return (
    <View className="gap-4 pb-6">
      <ScreenHeader title={t('changePassword.title')} />

      <FormTextField
        control={control}
        name="current"
        password
        tone="outline"
        label={t('changePassword.current')}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
        onSubmitEditing={() => nextRef.current?.focus()}
      />
      <FormTextField
        ref={nextRef}
        control={control}
        name="next"
        password
        tone="outline"
        label={t('changePassword.new')}
        placeholder={t('changePassword.newPlaceholder', {
          min: config.auth.minPasswordLength,
        })}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <FormTextField
        ref={confirmRef}
        control={control}
        name="confirm"
        password
        tone="outline"
        label={t('changePassword.confirm')}
        placeholder={t('changePassword.confirmPlaceholder')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      {changePassword.isSuccess ? (
        <Banner variant="success" message={t('changePassword.done')} />
      ) : null}
      <FormError error={changePassword.error} />

      <Button
        className="mt-6"
        icon="key"
        label={t('changePassword.submit')}
        loading={changePassword.isPending}
        onPress={submit}
      />
    </View>
  );
}
