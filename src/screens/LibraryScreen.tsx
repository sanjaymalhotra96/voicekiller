import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  View,
} from 'react-native';
import { illustrations } from '@/assets';
import {
  ActionSheet,
  AppText,
  ChipTabs,
  EmptyState,
  FormError,
  RenameSheet,
  TextField,
} from '@/components';
import {
  LibraryListItem,
  LibraryRow,
  toLibraryRows,
  useLibraryFilters,
  useLibraryItemActions,
  useLibraryItems,
} from '@/features/library';
import { usePlayback } from '@/hooks';
import { config } from '@/config';
import { textLimits } from '@/domain';
import { palette } from '@/theme';
import { cn } from '@/utils';

export function LibraryScreen() {
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
  const rows = useMemo(() => toLibraryRows(items), [items]);
  // Nothing to show: an empty library (not just an empty search result),
  // or files that could not be loaded. Both show the same friendly dog.
  const isEmptyLibrary =
    library.isError ||
    (library.isSuccess && items.length === 0 && !filters.isFiltering);

  const { toggle } = playback;
  const extraData = useMemo(
    () => ({ activeId: playback.activeId, playing: playback.playing }),
    [playback.activeId, playback.playing],
  );
  const renderRow = useCallback<ListRenderItem<LibraryRow>>(
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
          <ActivityIndicator color={palette.primary.DEFAULT} />
        </View>
      );
    }
    if (isEmptyLibrary) {
      return (
        <EmptyState
          illustration={illustrations.emptyLibrary}
          title={t('library.empty.title')}
          message={t('library.empty.message')}
        />
      );
    }
    return (
      <FlatList
        data={rows}
        keyExtractor={row => row.key}
        renderItem={renderRow}
        extraData={extraData}
        {...config.library.list}
        removeClippedSubviews
        className="flex-1"
        contentContainerClassName={cn('pb-6', rows.length === 0 && 'flex-1')}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshing={library.isRefetching && !library.isFetchingNextPage}
        onRefresh={() => library.refetch()}
        // Load the next page shortly before reaching the end.
        onEndReachedThreshold={0.5}
        onEndReached={() =>
          library.hasNextPage &&
          !library.isFetchingNextPage &&
          library.fetchNextPage()
        }
        ListFooterComponent={
          library.isFetchingNextPage ? (
            <ActivityIndicator
              className="py-4"
              color={palette.primary.DEFAULT}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon="search" title={t('library.noResults')} />
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
