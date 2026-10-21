import type { AudioPlayer } from 'expo-audio';
import React, { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  Icon,
  IconButton,
  PlaybackProgress,
  PlayButton,
} from '@/components';
import type { ResultItem } from '@/features/results/types';
import { iconSize, useColors } from '@/theme';
import { cn, formatDate } from '@/utils';

type Props = {
  item: ResultItem;
  // This card owns the shared player (orange border, live progress).
  active: boolean;
  playing: boolean;
  loading: boolean;
  player: AudioPlayer;
  onTogglePlay: (item: ResultItem) => void;
  // Omitted when the item cannot be renamed / deleted.
  onRename?: (item: ResultItem) => void;
  // Opens the file's text (Speech Editor, Speech to Text); replaces Rename.
  onView?: (item: ResultItem) => void;
  // Speech to Text makes View the primary action and moves playback below.
  viewPrimary?: boolean;
  downloadControl?: ReactNode;
  // Omitted when the result is not offered as a download.
  onDownload?: (item: ResultItem) => void;
  onDelete?: (item: ResultItem) => void;
};

// One result in a "Recent ..." / "My ..." grid: play, title, date or tag,
// and view or rename / download / delete. Memoised for long grids.
export const ResultCard = memo(function ResultCardInner({
  item,
  active,
  playing,
  loading,
  player,
  onTogglePlay,
  onRename,
  onView,
  viewPrimary = false,
  downloadControl,
  onDownload,
  onDelete,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const name = item.title;

  return (
    <View
      className={cn(
        'items-center gap-1 rounded-xl border bg-night px-3 pb-2 pt-4',
        active ? 'border-primary' : 'border-night-line',
      )}
    >
      {viewPrimary && onView ? (
        <IconButton
          variant="ghost"
          shape="circle"
          icon="eye"
          color={colors.primary.DEFAULT}
          className="size-play bg-night-surface"
          accessibilityLabel={t('results.view', { name })}
          onPress={() => onView(item)}
        />
      ) : (
        <PlayButton
          tone="night"
          playing={active && playing}
          loading={active && loading}
          disabled={!item.audioUrl}
          onPress={() => onTogglePlay(item)}
          accessibilityLabel={t(
            active && playing ? 'results.pause' : 'results.play',
            {
              name,
            },
          )}
        />
      )}
      {/* Keep the metadata's layout space while progress is shown over it. */}
      <View className="mt-2 w-full">
        <View
          className={cn('items-center gap-1', active && 'opacity-0')}
          accessibilityElementsHidden={active}
          importantForAccessibility={active ? 'no-hide-descendants' : 'auto'}
        >
          <AppText
            variant="label"
            numberOfLines={1}
            className="text-night-text"
          >
            {name}
          </AppText>
          {item.tag ? (
            <View className="flex-row items-center gap-1 rounded-full bg-night-line px-2 py-0.5">
              {item.tag.icon ? (
                <Icon
                  name={item.tag.icon}
                  size={iconSize.xxs}
                  color={colors.night.muted}
                />
              ) : null}
              <AppText variant="tag" className="text-night-muted">
                {item.tag.label}
              </AppText>
            </View>
          ) : item.createdAt ? (
            <AppText variant="timestamp" className="text-night-subtle">
              {t('results.created', { date: formatDate(item.createdAt) })}
            </AppText>
          ) : null}
        </View>
        {active ? (
          <View className="absolute inset-0 justify-center">
            <PlaybackProgress player={player} fallbackDuration={0} tone="night" />
          </View>
        ) : null}
      </View>
      <View className="mt-2 w-full flex-row justify-around border-t border-night-line pt-1">
        {viewPrimary ? (
          <PlayButton
            tone="night"
            playing={active && playing}
            loading={active && loading}
            disabled={!item.audioUrl}
            onPress={() => onTogglePlay(item)}
            accessibilityLabel={t(
              active && playing ? 'results.pause' : 'results.play',
              { name },
            )}
            compact
          />
        ) : onView ? (
          <IconButton
            variant="ghost"
            icon="eye"
            color={colors.night.muted}
            accessibilityLabel={t('results.view', { name })}
            onPress={() => onView(item)}
          />
        ) : onRename ? (
          <IconButton
            variant="ghost"
            icon="edit"
            color={colors.night.muted}
            accessibilityLabel={t('results.rename', { name })}
            onPress={() => onRename(item)}
          />
        ) : null}
        {downloadControl ??
          (onDownload ? (
            <IconButton
              variant="ghost"
              icon="download"
              color={colors.night.muted}
              disabled={!item.audioUrl}
              accessibilityLabel={t('results.download', { name })}
              onPress={() => onDownload(item)}
            />
          ) : null)}
        {onDelete ? (
          <IconButton
            variant="ghost"
            icon="trash"
            color={colors.danger.DEFAULT}
            accessibilityLabel={t('results.remove', { name })}
            onPress={() => onDelete(item)}
          />
        ) : null}
      </View>
    </View>
  );
});
