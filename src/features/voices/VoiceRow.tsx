import type { AudioPlayer } from 'expo-audio';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  AppText,
  ExpandableText,
  GradientPlayButton,
  IconButton,
  Radio,
} from '@/components';
import type { Voice } from '@/domain';
import { palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  voice: Voice;
  selected: boolean;
  // This row's sample owns the shared player.
  active: boolean;
  playing: boolean;
  player: AudioPlayer;
  onTogglePlay: (voice: Voice) => void;
  onToggleFavorite: (voice: Voice) => void;
  onSelect: (voice: Voice) => void;
};

// One voice: sample player, name, description, favourite and selection.
// Memoised: rows re-render only when their own props change.
export const VoiceRow = memo(function VoiceRowInner({
  voice,
  selected,
  active,
  playing,
  player,
  onTogglePlay,
  onToggleFavorite,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const name = voice.name;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t('voices.select', { name })}
      onPress={() => onSelect(voice)}
      className={cn(
        '-mx-4 flex-row items-center gap-3 border-b border-l-4 border-b-line-neutral px-4 py-3',
        active ? 'border-l-primary bg-primary-wash' : 'border-l-transparent',
      )}
    >
      <GradientPlayButton
        active={active}
        playing={playing}
        player={player}
        disabled={!voice.previewUrl}
        onPress={() => onTogglePlay(voice)}
        accessibilityLabel={t(active && playing ? 'voices.pause' : 'voices.play', {
          name,
        })}
      />
      <View className="flex-1 gap-1">
        <AppText variant="cardTitle" numberOfLines={1}>
          {name}
        </AppText>
        {voice.description ? <ExpandableText text={voice.description} /> : null}
      </View>
      <IconButton
        variant="ghost"
        icon={voice.isFavorite ? 'heartFilled' : 'heart'}
        color={voice.isFavorite ? palette.primary.DEFAULT : palette.ink.subtle}
        accessibilityLabel={t(voice.isFavorite ? 'voices.unfavorite' : 'voices.favorite', {
          name,
        })}
        accessibilityState={{ checked: voice.isFavorite }}
        onPress={() => onToggleFavorite(voice)}
      />
      <Radio selected={selected} tone="ink" />
    </Pressable>
  );
});
