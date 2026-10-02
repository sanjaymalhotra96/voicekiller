import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AppText, Button, ChipGroup, SelectField } from '@/components';
import {
  genders,
  VoiceFilters,
  VoiceProviderId,
  voiceProviderIds,
} from '@/domain';

type Props = {
  filters: VoiceFilters;
  onChange: (filters: VoiceFilters) => void;
  onPickAccent: () => void;
  onPickLanguage: () => void;
  onApply: () => void;
};

// Provider and gender chips, accent and language pickers, Apply.
export function VoiceFiltersForm({
  filters,
  onChange,
  onPickAccent,
  onPickLanguage,
  onApply,
}: Props) {
  const { t } = useTranslation();

  const providerChips = useMemo(
    () => [
      { key: 'all' as const, label: t('voices.providers.all') },
      ...voiceProviderIds.map(id => ({ key: id, label: t(`voices.providers.${id}`) })),
    ],
    [t],
  );
  const genderChips = useMemo(
    () => genders.map(id => ({ key: id, label: t(`voices.genders.${id}`) })),
    [t],
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 pb-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-3">
        <AppText variant="label">{t('voices.filters.provider')}</AppText>
        <ChipGroup<VoiceProviderId | 'all'>
          items={providerChips}
          value={filters.provider}
          onChange={provider => onChange({ ...filters, provider })}
        />
      </View>
      <View className="gap-3">
        <AppText variant="label">{t('voices.filters.gender')}</AppText>
        <ChipGroup
          items={genderChips}
          value={filters.gender}
          allowDeselect
          onChange={gender => onChange({ ...filters, gender })}
          onClear={() => onChange({ ...filters, gender: null })}
        />
      </View>
      <SelectField
        placeholder={t('voices.filters.accent')}
        value={filters.accent === 'auto' ? undefined : t(`accents.${filters.accent}`)}
        accessibilityLabel={t('voices.filters.accent')}
        onPress={onPickAccent}
      />
      <SelectField
        placeholder={t('voices.filters.language')}
        value={
          filters.language === 'auto' ? undefined : t(`languages.${filters.language}`)
        }
        accessibilityLabel={t('voices.filters.language')}
        onPress={onPickLanguage}
      />
      <Button className="mt-2" label={t('voices.filters.apply')} onPress={onApply} />
    </ScrollView>
  );
}
