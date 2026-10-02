import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Banner,
  BottomSheet,
  Button,
  FormError,
  FormTextField,
} from '@/components';
import { useChangeEmail } from '@/features/account/hooks';
import {
  changeEmailSchema,
  ChangeEmailValues,
} from '@/features/account/schemas';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Sheet to request an email change (Supabase sends a confirmation link).
export function ChangeEmailSheet({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const changeEmail = useChangeEmail();
  const { control, handleSubmit, reset } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ email: '' });
      changeEmail.reset();
    }
    // Only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const submit = handleSubmit(({ email }) => changeEmail.mutate(email));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('profile.changeEmail.title')}
      subtitle={t('profile.changeEmail.subtitle')}
    >
      <View className="gap-4">
        <FormTextField
          control={control}
          name="email"
          tone="outline"
          icon="mail"
          placeholder={t('profile.changeEmail.placeholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        {changeEmail.isSuccess ? (
          <Banner
            variant="success"
            message={t('profile.changeEmail.sent', {
              email: changeEmail.variables,
            })}
          />
        ) : null}
        <FormError error={changeEmail.error} />
        <Button
          label={t('profile.changeEmail.submit')}
          loading={changeEmail.isPending}
          onPress={submit}
        />
      </View>
    </BottomSheet>
  );
}
