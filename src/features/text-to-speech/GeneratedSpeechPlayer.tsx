import type { AudioPlayer } from 'expo-audio';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import {
  AppText,
  FormError,
  IconButton,
  PlaybackProgress,
  PlayButton,
} from '@/components';
import type { GeneratedSpeech } from '@/domain';
import { useAudioDownload } from '@/hooks/useAudioDownload';
import { useColors } from '@/theme';

type Props = {
  speech: GeneratedSpeech;
  player: AudioPlayer;
  active: boolean;
  playing: boolean;
  loading: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
};

// The latest generated file, shown below the editor's actions.
export function GeneratedSpeechPlayer({
  speech,
  player,
  active,
  playing,
  loading,
  onTogglePlay,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const download = useAudioDownload();

  return (
    <View className="gap-3 rounded-xl border border-line-neutral bg-surface p-3">
      <View className="flex-row items-center gap-3">
        <PlayButton
          playing={active && playing}
          loading={active && loading}
          onPress={onTogglePlay}
          accessibilityLabel={t(active && playing ? 'results.pause' : 'results.play', {
            name: speech.title,
          })}
        />
        <AppText variant="label" numberOfLines={1} className="flex-1 text-ink">
          {speech.title}
        </AppText>
        {download.isPending ? (
          <View className="size-icon-btn items-center justify-center">
            <ActivityIndicator
              color={colors.primary.DEFAULT}
              accessibilityLabel={t('results.download', { name: speech.title })}
            />
          </View>
        ) : (
          <IconButton
            variant="ghost"
            icon="download"
            accessibilityLabel={t('results.download', { name: speech.title })}
            onPress={() => download.download(speech)}
          />
        )}
        <IconButton
          variant="ghost"
          icon="close"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
        />
      </View>
      {active ? <PlaybackProgress player={player} fallbackDuration={0} /> : null}
      <FormError error={download.error} />
    </View>
  );
}
