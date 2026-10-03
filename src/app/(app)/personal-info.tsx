// Route: /personal-info
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Avatar,
  Banner,
  Button,
  ConfirmSheet,
  Dialog,
  FormError,
  FormTextField,
  IconButton,
  ScreenHeader,
  TextField,
  TextLink,
} from '@/components';
import { ChangeEmailSheet } from '@/features/account/ChangeEmailSheet';
import { useDeleteAccount, useUpdateProfile } from '@/features/account/hooks';
import { profileSchema, ProfileValues } from '@/features/account/schemas';
import { useAvatarPicker } from '@/features/account/useAvatarPicker';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { useCopyToClipboard, useUnsavedChangesGuard } from '@/hooks';
import { formatDateInput } from '@/utils';

export default function PersonalInfoScreen() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const avatar = useAvatarPicker();
  const clipboard = useCopyToClipboard();
  const [emailSheet, setEmailSheet] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, dob: user.dob },
  });

  // Keep the form in sync when the saved profile changes.
  useEffect(() => {
    reset({ fullName: user.fullName, dob: user.dob });
  }, [user.fullName, user.dob, reset]);

  const save = (afterSave?: () => void) =>
    handleSubmit(values =>
      updateProfile.mutate(values, {
        onSuccess: () => {
          reset(values);
          afterSave?.();
        },
      }),
    )();

  // Leaving with unsaved edits asks "Save changes?" first.
  const guard = useUnsavedChangesGuard(isDirty, {
    onDiscard: () => reset(),
    onSave: save,
  });

  return (
    <View className="gap-4 pb-6">
      <ScreenHeader title={t('profile.title')} />

      <Avatar
        size="lg"
        name={user.fullName}
        uri={user.avatarUrl}
        onEdit={avatar.pick}
        editLabel={t('profile.changePhoto')}
        uploading={avatar.uploading}
        className="mb-2 mt-4 self-center"
      />
      <FormError error={avatar.error} />

      <TextField
        tone="outline"
        label={t('profile.userId')}
        value={user.publicId}
        editable={false}
        trailing={
          <IconButton
            variant="ghost"
            icon={clipboard.copied ? 'check' : 'copy'}
            accessibilityLabel={
              clipboard.copied ? t('common.copied') : t('profile.copyId')
            }
            onPress={() => clipboard.copy(user.publicId)}
          />
        }
      />
      <FormTextField
        control={control}
        name="fullName"
        tone="outline"
        label={t('profile.fullName')}
        autoCapitalize="words"
        autoComplete="name"
      />
      <TextField
        tone="outline"
        label={t('profile.email')}
        value={user.email}
        editable={false}
        trailing={
          <TextLink
            label={t('common.change')}
            icon="edit"
            tone="accent"
            variant="caption"
            onPress={() => setEmailSheet(true)}
          />
        }
      />
      <FormTextField
        control={control}
        name="dob"
        tone="outline"
        label={t('profile.dob')}
        placeholder={t('profile.dobPlaceholder')}
        keyboardType="number-pad"
        maxLength={8}
        format={formatDateInput}
      />

      <TextLink
        label={t('profile.deleteAccount')}
        icon="trash"
        tone="danger"
        onPress={() => setDeleteSheet(true)}
        className="self-start"
      />

      {updateProfile.isSuccess && !isDirty ? (
        <Banner variant="success" message={t('profile.saved')} />
      ) : null}
      <FormError error={updateProfile.error} />

      {isDirty ? (
        <Button
          className="mt-4"
          label={t('profile.save')}
          loading={updateProfile.isPending}
          onPress={() => save()}
        />
      ) : null}

      <ChangeEmailSheet
        visible={emailSheet}
        onClose={() => setEmailSheet(false)}
      />

      <ConfirmSheet
        visible={deleteSheet}
        onClose={() => setDeleteSheet(false)}
        title={t('profile.delete.title')}
        message={t('profile.delete.message')}
        confirmWord={t('profile.delete.word')}
        prompt={t('profile.delete.prompt', { word: t('profile.delete.word') })}
        submitLabel={t('profile.delete.submit')}
        loading={deleteAccount.isPending}
        error={deleteAccount.error}
        // Success signs out; RootNavigator returns to Welcome.
        onConfirm={() => deleteAccount.mutate()}
      />

      <Dialog
        visible={guard.visible}
        onClose={guard.cancel}
        title={t('profile.unsaved.title')}
        message={t('profile.unsaved.message')}
        actions={[
          {
            label: t('profile.unsaved.discard'),
            variant: 'neutral',
            onPress: guard.discard,
          },
          {
            label: t('profile.unsaved.confirm'),
            loading: updateProfile.isPending,
            onPress: guard.save,
          },
        ]}
      />
    </View>
  );
}
