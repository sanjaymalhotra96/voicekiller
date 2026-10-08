import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { ProgressBar } from '@/components/media/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, useColors } from '@/theme';

type Props = {
  uri: string;
};

// Grey card with a progress bar and a large play/pause button, for result
// sheets (Speech Editor, Speech to Text). Owns one player for `uri`,
// released when the card unmounts. Give it `key={uri}` to switch audio.
export function AudioPlayerCard({ uri }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const player = useAudioPlayer(uri);
  const { playing, currentTime, duration, didJustFinish } =
    useAudioPlayerStatus(player);

  const toggle = () => {
    if (playing) {
      player.pause();
      return;
    }
    if (didJustFinish || (duration > 0 && currentTime >= duration)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View className="gap-4 rounded-xl border border-line-neutral bg-muted px-4 pb-4 pt-3">
      <ProgressBar current={currentTime} total={duration} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? t('player.pause') : t('player.play')}
        hitSlop={layout.hitSlop}
        onPress={toggle}
        className="size-play-lg items-center justify-center self-center rounded-full border border-line bg-surface active:opacity-70"
      >
        <Icon
          name={playing ? 'pause' : 'play'}
          size={iconSize.md}
          color={colors.primary.DEFAULT}
        />
      </Pressable>
    </View>
  );
}
