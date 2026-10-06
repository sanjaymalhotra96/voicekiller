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

const allLanguages: readonly LanguageId[] = languageIds.filter(
  id => id !== 'auto',
);

type Props<L extends LanguageId> = {
  label: string;
  // null = none chosen (only with `noneLabel`).
  value: L | null;
  onChange: (language: L | null) => void;
  // Adds a first option that clears the value ("None").
  noneLabel?: string;
  // Only these languages (default: all but `auto`).
  languages?: readonly L[];
  tone?: FieldTone;
};

// "Language  >" field with its picker sheet. `auto` is not offered:
// a voice or a transcript has one concrete language.
export function LanguageField<L extends LanguageId = LanguageId>({
  label,
  value,
  onChange,
  noneLabel,
  languages = allLanguages as readonly L[],
  tone = 'night',
}: Props<L>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const items = languages.map(id => ({
      key: id as string,
      label: t(`languages.${id}`),
    }));
    return noneLabel ? [{ key: NONE, label: noneLabel }, ...items] : items;
  }, [t, noneLabel, languages]);

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
        onSelect={key => onChange(key === NONE ? null : (key as L))}
      />
    </View>
  );
}
