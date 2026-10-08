import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Artwork, ArtworkSource } from '@/components/ui/Artwork';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/form/FormError';
import { Icon, IconName } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { iconSize, layout, useColors } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  // Word the user must type to enable the button ("DELETE").
  confirmWord: string;
  prompt: string;
  submitLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  error?: unknown;
  illustration?: ArtworkSource;
  icon?: IconName;
};

// Bottom sheet for irreversible actions: type a word to unlock the button.
export function ConfirmSheet({
  visible,
  onClose,
  title,
  message,
  confirmWord,
  prompt,
  submitLabel,
  onConfirm,
  loading,
  error,
  illustration,
  icon = 'trash',
}: Props) {
  const colors = useColors();
  const [typed, setTyped] = useState('');
  const matches = typed.trim() === confirmWord;

  // Start empty every time it opens.
  useEffect(() => {
    if (visible) {
      setTyped('');
    }
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="items-center gap-2">
        {illustration ? (
          <Artwork source={illustration} {...layout.emptyArt} />
        ) : (
          <Icon
            name={icon}
            size={iconSize.xxl}
            color={colors.primary.DEFAULT}
          />
        )}
        <AppText variant="title" className="mt-2 text-center">
          {title}
        </AppText>
        <AppText variant="subtitle" className="text-center text-ink">
          {message}
        </AppText>
      </View>
      <View className="mt-6 gap-4">
        <TextField
          tone="outline"
          label={prompt}
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <FormError error={error} />
        <Button
          variant="danger"
          label={submitLabel}
          disabled={!matches}
          loading={loading}
          onPress={onConfirm}
        />
      </View>
    </BottomSheet>
  );
}
