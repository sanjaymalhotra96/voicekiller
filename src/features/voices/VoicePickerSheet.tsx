import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import {
  Badge,
  BottomSheet,
  ChipTabs,
  IconButton,
  OptionList,
  TextField,
} from '@/components';
import { config } from '@/config';
import {
  AccentId,
  accentIds,
  activeFilterCount,
  defaultVoiceFilters,
  LanguageId,
  languageIds,
  Voice,
  VoiceFilters,
  VoiceSource,
  voiceSources,
} from '@/domain';
import { VoiceFiltersForm } from '@/features/voices/VoiceFiltersForm';
import { VoiceList } from '@/features/voices/VoiceList';
import { useDebouncedValue } from '@/hooks';
import { layout } from '@/theme';

// The sheet swaps its content instead of stacking modals:
// list -> filters -> accent | language.
type PickerView = 'list' | 'filters' | 'accent' | 'language';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (voice: Voice) => void;
};

// "Select Voice": source tabs, search, filters and the voice list.
// Search and filters survive closing, so reopening shows the same view.
export function VoicePickerSheet({ visible, onClose, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<PickerView>('list');
  const [source, setSource] = useState<VoiceSource>('library');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), config.voices.searchDebounceMs);
  // Applied filters, and the copy being edited until "Apply Filters".
  const [filters, setFilters] = useState<VoiceFilters>(defaultVoiceFilters);
  const [draft, setDraft] = useState<VoiceFilters>(defaultVoiceFilters);
  const filterCount = activeFilterCount(filters);

  const query = useMemo(
    () => ({ source, search: debounced, filters }),
    [source, debounced, filters],
  );
  const sourceTabs = useMemo(
    () => voiceSources.map(key => ({ key, label: t(`voices.sources.${key}`) })),
    [t],
  );
  const accentOptions = useMemo(
    () => accentIds.map(key => ({ key, label: t(`accents.${key}`) })),
    [t],
  );
  const languageOptions = useMemo(
    () => languageIds.map(key => ({ key, label: t(`languages.${key}`) })),
    [t],
  );

  // X and the hardware back button step back one view before closing.
  const back = () => {
    if (view === 'accent' || view === 'language') {
      setView('filters');
    } else if (view === 'filters') {
      setView('list');
    } else {
      onClose();
    }
  };

  const select = useCallback(
    (voice: Voice) => {
      onSelect(voice);
      onClose();
    },
    [onSelect, onClose],
  );

  const titles: Record<PickerView, string> = {
    list: t('voices.title'),
    filters: t('voices.filters.title'),
    accent: t('voices.filters.accent'),
    language: t('voices.filters.language'),
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={back}
      title={titles[view]}
      height={layout.pickerSheetHeight}
      scrollable={false}
    >
      {view === 'list' ? (
        <View className="flex-1 gap-4">
          <ChipTabs
            items={sourceTabs}
            value={source}
            onChange={setSource}
            className="-mx-4"
            contentClassName="px-4"
          />
          <View className="flex-row items-center gap-3">
            <TextField
              size="sm"
              tone="filled"
              icon="search"
              placeholder={t('voices.search')}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
              className="flex-1"
            />
            <View>
              <IconButton
                shape="field"
                variant="muted"
                icon="filter"
                accessibilityLabel={
                  filterCount > 0
                    ? t('voices.openFiltersCount', { count: filterCount })
                    : t('voices.openFilters')
                }
                onPress={() => {
                  setDraft(filters);
                  setView('filters');
                }}
              />
              {filterCount > 0 ? (
                <Badge
                  variant="count"
                  label={String(filterCount)}
                  className="absolute -right-1.5 -top-1.5"
                />
              ) : null}
            </View>
          </View>
          <VoiceList query={query} selectedId={selectedId} onSelect={select} />
        </View>
      ) : view === 'filters' ? (
        <VoiceFiltersForm
          filters={draft}
          onChange={setDraft}
          onPickAccent={() => setView('accent')}
          onPickLanguage={() => setView('language')}
          onApply={() => {
            setFilters(draft);
            setView('list');
          }}
        />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {view === 'accent' ? (
            <OptionList<AccentId>
              options={accentOptions}
              value={draft.accent}
              onSelect={accent => {
                setDraft({ ...draft, accent });
                setView('filters');
              }}
            />
          ) : (
            <OptionList<LanguageId>
              options={languageOptions}
              value={draft.language}
              onSelect={language => {
                setDraft({ ...draft, language });
                setView('filters');
              }}
            />
          )}
        </ScrollView>
      )}
    </BottomSheet>
  );
}
