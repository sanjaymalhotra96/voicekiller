import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OptionSheet } from '@/components/overlays/OptionSheet';
import { FieldLabel } from '@/components/ui/FieldLabel';
import type { FieldTone } from '@/components/ui/fieldTones';
import { SelectField } from '@/components/ui/SelectField';
import { LanguageId, languageIds } from '@/domain';

// Sentinel option key for "no language" (e.g. no translation).
const NONE = 'none';

type Props = {
  label: string;
  // null = none chosen (only with `noneLabel`).
  value: LanguageId | null;
  onChange: (language: LanguageId | null) => void;
  // Adds a first option that clears the value ("None").
  noneLabel?: string;
  tone?: FieldTone;
};

// "Language  >" field with its picker sheet. `auto` is not offered:
// a voice or a transcript has one concrete language.
export function LanguageField({
  label,
  value,
  onChange,
  noneLabel,
  tone = 'night',
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const languages = languageIds
      .filter(id => id !== 'auto')
      .map(id => ({ key: id as string, label: t(`languages.${id}`) }));
    return noneLabel ? [{ key: NONE, label: noneLabel }, ...languages] : languages;
  }, [t, noneLabel]);

  const display = value ? t(`languages.${value}`) : noneLabel;

  return (
    <View className="gap-1.5">
      <FieldLabel label={label} tone={tone === 'night' ? 'night' : 'light'} />
      <SelectField
        tone={tone}
        value={display}
        placeholder={label}
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
      />
      <OptionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        value={value ?? NONE}
        onSelect={key => onChange(key === NONE ? null : (key as LanguageId))}
      />
    </View>
  );
}
