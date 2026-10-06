import type { AudioPlayer } from 'expo-audio';
import React, { memo } from 'react';
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
import { iconSize, palette } from '@/theme';
import { cn, formatDate } from '@/utils';

type Props = {
  item: ResultItem;
  // This card owns the shared player (orange border, live progress).
  active: boolean;
  playing: boolean;
  player: AudioPlayer;
  onTogglePlay: (item: ResultItem) => void;
  // Omitted when the item cannot be renamed / deleted.
  onRename?: (item: ResultItem) => void;
  // Opens the file's text (Speech Editor, Speech to Text); replaces Rename.
  onView?: (item: ResultItem) => void;
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
  player,
  onTogglePlay,
  onRename,
  onView,
  onDownload,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const name = item.title;

  return (
    <View
      className={cn(
        'items-center gap-1 rounded-xl border bg-night px-3 pb-2 pt-4',
        active ? 'border-primary' : 'border-night-line',
      )}
    >
      <PlayButton
        tone="night"
        playing={active && playing}
        disabled={!item.audioUrl}
        onPress={() => onTogglePlay(item)}
        accessibilityLabel={t(active && playing ? 'results.pause' : 'results.play', {
          name,
        })}
      />
      {active ? (
        <View className="mt-3 w-full">
          <PlaybackProgress player={player} fallbackDuration={0} tone="night" />
        </View>
      ) : (
        <>
          <AppText
            variant="label"
            numberOfLines={1}
            className="mt-2 text-night-text"
          >
            {name}
          </AppText>
          {item.tag ? (
            <View className="flex-row items-center gap-1 rounded-full bg-night-line px-2 py-0.5">
              {item.tag.icon ? (
                <Icon
                  name={item.tag.icon}
                  size={iconSize.xxs}
                  color={palette.night.muted}
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
        </>
      )}
      <View className="mt-2 w-full flex-row justify-around border-t border-night-line pt-1">
        {onView ? (
          <IconButton
            variant="ghost"
            icon="eye"
            color={palette.night.muted}
            accessibilityLabel={t('results.view', { name })}
            onPress={() => onView(item)}
          />
        ) : onRename ? (
          <IconButton
            variant="ghost"
            icon="edit"
            color={palette.night.muted}
            accessibilityLabel={t('results.rename', { name })}
            onPress={() => onRename(item)}
          />
        ) : null}
        {onDownload ? (
          <IconButton
            variant="ghost"
            icon="download"
            color={palette.night.muted}
            disabled={!item.audioUrl}
            accessibilityLabel={t('results.download', { name })}
            onPress={() => onDownload(item)}
          />
        ) : null}
        {onDelete ? (
          <IconButton
            variant="ghost"
            icon="trash"
            color={palette.danger.DEFAULT}
            accessibilityLabel={t('results.remove', { name })}
            onPress={() => onDelete(item)}
          />
        ) : null}
      </View>
    </View>
  );
});
