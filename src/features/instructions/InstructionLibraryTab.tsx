import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native';
import { Button, ChipTabs, EmptyState, TextField } from '@/components';
import type { ActingInstruction } from '@/domain';
import { useActingInstructions } from '@/features/instructions/hooks';
import { InstructionRow } from '@/features/instructions/InstructionRow';
import { useInstructionFilters } from '@/features/instructions/useInstructionFilters';
import { useInstructionSelection } from '@/features/instructions/useInstructionSelection';
import { usePlayback } from '@/hooks';
import { errorMessageKey } from '@/lib/errors';
import { palette } from '@/theme';

const EMPTY: ActingInstruction[] = [];

// Library tab: category chips, search and the instruction list.
export function InstructionLibraryTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const library = useActingInstructions();
  const filters = useInstructionFilters(library.data ?? EMPTY);
  const selection = useInstructionSelection();
  const playback = usePlayback();

  const { toggle, player } = playback;
  const playSample = useCallback(
    (item: ActingInstruction) =>
      toggle({ id: item.id, audioUrl: item.sampleAudioUrl }),
    [toggle],
  );
  const openDetails = useCallback(
    (item: ActingInstruction) => router.push(`/acting-instructions/${item.id}`),
    [router],
  );
  const { selectLibrary, libraryId } = selection;

  const renderItem = useCallback<ListRenderItem<ActingInstruction>>(
    ({ item }) => {
      const active = playback.activeId === item.id;
      return (
        <InstructionRow
          item={item}
          selected={item.id === libraryId}
          active={active}
          playing={active && playback.playing}
          player={player}
          onTogglePlay={playSample}
          onInfo={openDetails}
          onSelect={selectLibrary}
        />
      );
    },
    [
      playback.activeId,
      playback.playing,
      player,
      playSample,
      openDetails,
      selectLibrary,
      libraryId,
    ],
  );

  if (library.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={palette.primary.DEFAULT} />
      </View>
    );
  }
  if (library.isError) {
    return (
      <EmptyState
        icon="cloudOff"
        title={t(errorMessageKey(library.error))}
        action={
          <Button
            size="sm"
            icon="refresh"
            label={t('library.retry')}
            onPress={() => library.refetch()}
          />
        }
      />
    );
  }

  return (
    <View className="flex-1 gap-4">
      <ChipTabs
        items={filters.chips}
        value={filters.filter}
        onChange={filters.setFilter}
        className="-mx-4"
        contentClassName="px-4"
      />
      <TextField
        size="sm"
        tone="muted"
        icon="search"
        placeholder={t('instructions.search')}
        value={filters.search}
        onChangeText={filters.setSearch}
        returnKeyType="search"
        autoCorrect={false}
      />
      <FlatList
        data={filters.visible}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        extraData={playback.activeId}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        ListEmptyComponent={
          <EmptyState icon="search" title={t('instructions.noResults')} className="py-12" />
        }
      />
    </View>
  );
}
