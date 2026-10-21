import type { AudioPlayer } from 'expo-audio';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  AppText,
  GradientPlayButton,
  Icon,
  IconButton,
  Radio,
  Tag,
} from '@/components';
import { ActingInstruction, isAutomaticInstruction } from '@/domain';
import { categoryTones } from '@/features/instructions/categories';
import { gradientStyle, iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  item: ActingInstruction;
  selected: boolean;
  active: boolean;
  playing: boolean;
  loading: boolean;
  player: AudioPlayer;
  onTogglePlay: (item: ActingInstruction) => void;
  onInfo: (item: ActingInstruction) => void;
  onSelect: (item: ActingInstruction) => void;
};

// Library instruction: sample player, name, category, details, selection.
export const InstructionRow = memo(function InstructionRowInner({
  item,
  selected,
  active,
  playing,
  loading,
  player,
  onTogglePlay,
  onInfo,
  onSelect,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const name = item.name;
  const automatic = isAutomaticInstruction(item);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t('instructions.select', { name })}
      onPress={() => onSelect(item)}
      className={cn(
        '-mx-4 flex-row items-center gap-3 border-b border-l-4 border-b-line-neutral px-4 py-4',
        active ? 'border-l-primary bg-primary-wash' : 'border-l-transparent',
      )}
    >
      {automatic ? (
        <View
          style={gradientStyle(colors, 'ai')}
          className="size-play-lg items-center justify-center overflow-hidden rounded-full bg-ai"
        >
          <Icon name="sparkles" size={iconSize.md} color={colors.contrast} />
        </View>
      ) : (
        <GradientPlayButton
          active={active}
          playing={playing}
          loading={loading}
          player={player}
          disabled={!item.sampleAudioUrl}
          onPress={() => onTogglePlay(item)}
          accessibilityLabel={t(
            active && playing ? 'instructions.pause' : 'instructions.play',
            { name },
          )}
        />
      )}
      <View className="flex-1 items-start gap-1.5">
        <AppText variant="cardTitle" numberOfLines={1}>
          {name}
        </AppText>
        {item.category ? (
          <Tag
            label={t(`instructions.categories.${item.category}`)}
            tone={categoryTones[item.category]}
          />
        ) : null}
      </View>
      <IconButton
        variant="ghost"
        icon="info"
        color={colors.ink.subtle}
        accessibilityLabel={t('instructions.details', { name })}
        onPress={() => onInfo(item)}
      />
      <Radio selected={selected} tone="ink" />
    </Pressable>
  );
});
