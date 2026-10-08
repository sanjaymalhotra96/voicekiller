import type { AudioPlayer } from 'expo-audio';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  AppText,
  GradientPlayButton,
  IconButton,
  Radio,
  Tag,
} from '@/components';
import type { ActingInstruction } from '@/domain';
import { categoryTones } from '@/features/instructions/categories';
import { useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  item: ActingInstruction;
  selected: boolean;
  active: boolean;
  playing: boolean;
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
  player,
  onTogglePlay,
  onInfo,
  onSelect,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const name = item.name;

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
      <GradientPlayButton
        active={active}
        playing={playing}
        player={player}
        disabled={!item.sampleAudioUrl}
        onPress={() => onTogglePlay(item)}
        accessibilityLabel={t(
          active && playing ? 'instructions.pause' : 'instructions.play',
          { name },
        )}
      />
      <View className="flex-1 items-start gap-1.5">
        <AppText variant="cardTitle" numberOfLines={1}>
          {name}
        </AppText>
        <Tag
          label={t(`instructions.categories.${item.category}`)}
          tone={categoryTones[item.category]}
        />
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
