// Route: /library
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { images } from '@/assets';
import {
  FlashList,
  FlashListRenderItem,
  ActionSheet,
  AppText,
  ChipTabs,
  EmptyState,
  FormError,
  RenameSheet,
  TextField,
} from '@/components';
import { LibraryRow, toLibraryRows } from '@/features/library/grouping';
import { useLibraryItems } from '@/features/library/hooks';
import { LibraryListItem } from '@/features/library/LibraryListItem';
import { useLibraryFilters } from '@/features/library/useLibraryFilters';
import { useLibraryItemActions } from '@/features/library/useLibraryItemActions';
import { usePlayback } from '@/hooks';
import { config } from '@/config';
import { textLimits } from '@/domain';
import { useColors } from '@/theme';
import { cn } from '@/utils';

export default function LibraryScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const filters = useLibraryFilters();
  const library = useLibraryItems(filters.query);
  const playback = usePlayback();
  const actions = useLibraryItemActions({
    onBeforeDelete: item => playback.activeId === item.id && playback.stop(),
  });

  const items = useMemo(
    () => library.data?.pages.flatMap(page => page.items) ?? [],
    [library.data],
  );
  // All tab (not searching): an overview, the newest few per date group.
  // A feature chip or a search shows every file and loads more on scroll.
  const isOverview = filters.query.filter === 'all' && !filters.query.search;
  const rows = useMemo(
    () =>
      toLibraryRows(
        items,
        isOverview ? config.library.allTabPerGroup : Infinity,
      ),
    [items, isOverview],
  );
  // Nothing to show: an empty library (not just an empty search result),
  // or files that could not be loaded. Both show the same friendly dog.
  // Pull to refresh only. A background refetch (switching back to a chip)
  // must not drive the spinner: on iOS that locks the list in place.
  const [pulling, setPulling] = useState(false);
  const refresh = useCallback(async () => {
    setPulling(true);
    try {
      await library.refetch();
    } finally {
      setPulling(false);
    }
  }, [library]);

  const isEmptyLibrary =
    library.isError ||
    (library.isSuccess && items.length === 0 && !filters.isFiltering);

  const { toggle } = playback;
  const extraData = useMemo(
    () => ({ activeId: playback.activeId, playing: playback.playing }),
    [playback.activeId, playback.playing],
  );
  const renderRow = useCallback<FlashListRenderItem<LibraryRow>>(
    ({ item: row, index }) => {
      if (row.type === 'header') {
        return (
          <AppText
            variant="overline"
            accessibilityRole="header"
            className={cn('pb-1', index > 0 ? 'pt-6' : 'pt-2')}
          >
            {t(`library.groups.${row.group}`)}
          </AppText>
        );
      }
      const active = playback.activeId === row.item.id;
      return (
        <LibraryListItem
          item={row.item}
          active={active}
          playing={active && playback.playing}
          player={playback.player}
          onTogglePlay={toggle}
          onMore={actions.openMenu}
        />
      );
    },
    // No position here: rows re-render only when the active file or
    // play/pause changes. <PlaybackProgress> handles the moving bar.
    [
      t,
      toggle,
      actions.openMenu,
      playback.activeId,
      playback.playing,
      playback.player,
    ],
  );

  const body = (() => {
    if (library.isPending) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary.DEFAULT} />
        </View>
      );
    }
    if (isEmptyLibrary) {
      return (
        <EmptyState
          illustration={images.libraryEmpty}
          title={t('library.empty.title')}
          message={t('library.empty.message')}
        />
      );
    }
    return (
      <FlashList
        data={rows}
        keyExtractor={row => row.key}
        // Headers and file rows are recycled separately.
        getItemType={row => row.type}
        renderItem={renderRow}
        extraData={extraData}
        className="flex-1"
        contentContainerClassName={cn('pb-6', rows.length === 0 && 'flex-1')}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshing={pulling}
        onRefresh={refresh}
        // Load the next page shortly before reaching the end.
        onEndReachedThreshold={0.5}
        onEndReached={() =>
          !isOverview &&
          library.hasNextPage &&
          !library.isFetchingNextPage &&
          library.fetchNextPage()
        }
        ListFooterComponent={
          library.isFetchingNextPage ? (
            <ActivityIndicator
              className="py-4"
              color={colors.primary.DEFAULT}
            />
          ) : null
        }
        // A search with no matches says so; a feature chip with no files
        // shows the same dog and message as an empty library.
        ListEmptyComponent={
          filters.query.search ? (
            <EmptyState icon="search" title={t('library.noResults')} />
          ) : (
            <EmptyState
              illustration={images.libraryEmpty}
              title={t('library.empty.title')}
              message={t('library.empty.message')}
            />
          )
        }
      />
    );
  })();

  return (
    <View className="flex-1 gap-4 pt-4">
      <AppText variant="heading" accessibilityRole="header">
        {t('library.title')}
      </AppText>

      <TextField
        size="sm"
        tone="outline"
        icon="search"
        placeholder={t('library.search')}
        value={filters.search}
        onChangeText={filters.setSearch}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      {isEmptyLibrary ? null : (
        <ChipTabs
          items={filters.chips}
          value={filters.filter}
          onChange={filters.setFilter}
          className="-mx-4"
          contentClassName="px-4"
        />
      )}

      <FormError error={actions.error} />

      {body}

      <ActionSheet title={t('library.actions.title')} {...actions.menu} />
      <RenameSheet
        {...actions.renameSheet}
        title={t('library.rename.title')}
        placeholder={t('library.rename.placeholder')}
        maxLength={textLimits.fileTitle}
      />
    </View>
  );
}
