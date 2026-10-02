import React, { memo, ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { PlayButton } from '@/components/media/PlayButton';
import { cn } from '@/utils';

type Props = {
  title: string;
  // Meta shown under the title when not playing (tags, etc.).
  meta?: ReactNode;
  // This row owns the player (highlighted, shows progress).
  active: boolean;
  playing: boolean;
  // Shown instead of meta while active (e.g. a live progress bar).
  progress?: ReactNode;
  onTogglePlay: () => void;
  onMore: () => void;
  playLabel: string;
  moreLabel: string;
  // Full-bleed highlight: offsets the screen's horizontal padding.
  className?: string;
};

// Audio list row: play button, title, meta or progress, and a ⋮ menu.
export const MediaRow = memo(function MediaRowInner({
  title,
  meta,
  active,
  playing,
  progress,
  onTogglePlay,
  onMore,
  playLabel,
  moreLabel,
  className,
}: Props) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-3 border-l-4 py-3',
        active ? 'border-primary bg-tone-orange-soft' : 'border-transparent',
        className,
      )}
    >
      <PlayButton
        playing={active && playing}
        onPress={onTogglePlay}
        accessibilityLabel={playLabel}
      />
      <View className="flex-1 gap-1.5">
        <AppText variant="rowTitle" numberOfLines={1}>
          {title}
        </AppText>
        {active && progress ? (
          progress
        ) : (
          <View className="flex-row flex-wrap gap-1.5">{meta}</View>
        )}
      </View>
      <IconButton
        icon="moreVertical"
        variant="ghost"
        accessibilityLabel={moreLabel}
        onPress={onMore}
      />
    </View>
  );
});
