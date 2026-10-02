import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

type Props = {
  visible: boolean;
  // Pre-filled each time the sheet opens.
  initialValue: string;
  title: string;
  // Small label above the field ("Edit your name").
  label?: string;
  placeholder: string;
  maxLength: number;
  onClose: () => void;
  onSave: (value: string) => void;
};

// Bottom sheet with one name field (rename a file, a cloned voice...).
export function RenameSheet({
  visible,
  initialValue,
  title,
  label,
  placeholder,
  maxLength,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setTouched(false);
    }
  }, [visible, initialValue]);

  const trimmed = value.trim();
  const submit = () => {
    setTouched(true);
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-6">
        <TextField
          tone="outline"
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          maxLength={maxLength}
          error={touched && !trimmed ? t('validation.titleRequired') : undefined}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Button label={t('common.save')} onPress={submit} />
      </View>
    </BottomSheet>
  );
}
