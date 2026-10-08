import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import {
  FlashList,
  FlashListRenderItem,
  Button,
  EmptyState,
  FormError,
} from '@/components';
import type { Voice, VoiceQuery } from '@/domain';
import {
  useFavoriteVoices,
  useToggleFavorite,
  useVoices,
} from '@/features/voices/hooks';
import { VoiceRow } from '@/features/voices/VoiceRow';
import { usePlayback } from '@/hooks';
import { errorMessageKey } from '@/lib/errors';
import { useColors } from '@/theme';

type Props = {
  query: VoiceQuery;
  selectedId: string | null;
  onSelect: (voice: Voice) => void;
};

// Virtualised, infinitely loading voice list with one shared sample
// player. Mounted only while the picker is open, so the player and the
// pages are released when it closes.
export function VoiceList({ query, selectedId, onSelect }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const voices = useVoices(query);
  const favorite = useToggleFavorite();
  const favorites = useFavoriteVoices();
  const favoriteIds = favorites.ids;
  const playback = usePlayback();

  const items = useMemo(
    () => voices.data?.pages.flatMap(page => page.items) ?? [],
    [voices.data],
  );

  const { toggle, player } = playback;
  const playVoice = useCallback(
    (voice: Voice) => toggle({ id: voice.id, audioUrl: voice.previewUrl }),
    [toggle],
  );
  const toggleFavorite = favorite.toggle;

  const renderItem = useCallback<FlashListRenderItem<Voice>>(
    ({ item }) => {
      const active = playback.activeId === item.id;
      return (
        <VoiceRow
          voice={item}
          selected={item.id === selectedId}
          active={active}
          playing={active && playback.playing}
          player={player}
          onTogglePlay={playVoice}
          favorite={favoriteIds.has(item.id)}
          onToggleFavorite={toggleFavorite}
          onSelect={onSelect}
        />
      );
    },
    [
      playback.activeId,
      playback.playing,
      player,
      playVoice,
      toggleFavorite,
      favoriteIds,
      onSelect,
      selectedId,
    ],
  );

  if (voices.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }
  if (voices.isError) {
    return (
      <EmptyState
        icon="cloudOff"
        title={t(errorMessageKey(voices.error))}
        action={
          <Button
            size="sm"
            icon="refresh"
            label={t('library.retry')}
            onPress={() => voices.refetch()}
          />
        }
      />
    );
  }

  return (
    <View className="flex-1">
      <FormError error={favorite.error ?? favorites.error} className="mb-2" />
      <FlashList
        data={items}
        keyExtractor={voice => voice.id}
        renderItem={renderItem}
        extraData={playback.activeId}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // iOS: rows under the keyboard stay reachable.
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() =>
          voices.hasNextPage &&
          !voices.isFetchingNextPage &&
          voices.fetchNextPage()
        }
        ListFooterComponent={
          voices.isFetchingNextPage ? (
            <ActivityIndicator
              className="py-4"
              color={colors.primary.DEFAULT}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={query.source === 'favorites' ? 'heart' : 'search'}
            title={
              query.source === 'favorites'
                ? t('voices.emptyFavorites')
                : t('voices.empty')
            }
            className="py-12"
          />
        }
      />
    </View>
  );
}
