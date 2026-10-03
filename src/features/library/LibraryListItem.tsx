import type { AudioPlayer } from 'expo-audio';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaRow, PlaybackProgress, Tag } from '@/components';
import type { LibraryItem } from '@/features/library/types';
import { tools } from '@/features/tools/tools';
import { formatDuration } from '@/utils';

type Props = {
  item: LibraryItem;
  active: boolean;
  playing: boolean;
  // Shared player; only the active row subscribes to its position.
  player: AudioPlayer;
  onTogglePlay: (item: LibraryItem) => void;
  onMore: (item: LibraryItem) => void;
};

// One Library file: tool tag, voice and length; live progress while active.
// Memoised: inactive rows don't re-render while another row plays.
export const LibraryListItem = memo(function LibraryListItemInner({
  item,
  active,
  playing,
  player,
  onTogglePlay,
  onMore,
}: Props) {
  const { t } = useTranslation();

  return (
    <MediaRow
      title={item.title}
      active={active}
      playing={playing}
      progress={
        active ? (
          <PlaybackProgress
            player={player}
            fallbackDuration={item.durationSeconds}
          />
        ) : undefined
      }
      onTogglePlay={() => onTogglePlay(item)}
      onMore={() => onMore(item)}
      playLabel={t(
        active && playing ? 'library.actions.pause' : 'library.actions.play',
        { title: item.title },
      )}
      moreLabel={t('library.actions.more', { title: item.title })}
      className="-mx-4 px-4"
      meta={
        <>
          <Tag
            label={t(`tools.${item.tool}.tag`)}
            tone={tools[item.tool].tone}
          />
          {item.voiceName ? (
            <Tag label={item.voiceName} tone="purple" icon="mic" />
          ) : null}
          <Tag
            label={formatDuration(item.durationSeconds)}
            tone="blue"
            icon="clock"
          />
        </>
      }
    />
  );
});
