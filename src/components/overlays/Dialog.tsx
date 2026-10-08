import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/ui/AppText';
import { Button, ButtonVariant } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { layout, useColors } from '@/theme';

type DialogAction = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  // Shown side by side; usually [secondary, primary].
  actions: DialogAction[];
};

// Centred dialog with a close button and side-by-side actions
// ("Save changes?  Discard | Confirm").
export function Dialog({ visible, onClose, title, message, actions }: Props) {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.overlay }}
      >
        {/* Inner Pressable swallows taps so they don't close the dialog. */}
        <Pressable
          accessibilityRole="alert"
          onPress={() => {}}
          className="w-full gap-2 rounded-2xl bg-surface px-4 pb-4 pt-3"
          style={{ maxWidth: layout.dialogMaxWidth }}
        >
          <IconButton
            shape="circle"
            icon="close"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            className="self-end"
          />
          <AppText variant="title" className="text-center text-xl">
            {title}
          </AppText>
          {message ? (
            <AppText variant="subtitle" className="text-center text-ink">
              {message}
            </AppText>
          ) : null}
          <View className="mt-4 flex-row gap-3">
            {actions.map(action => (
              <Button
                key={action.label}
                className="flex-1"
                label={action.label}
                variant={action.variant ?? 'primary'}
                loading={action.loading}
                onPress={action.onPress}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
