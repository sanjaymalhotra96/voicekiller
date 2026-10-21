// Route: /acting-instructions/:id
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import {
  AppText,
  Button,
  EmptyState,
  GradientPlayButton,
  ScreenHeader,
  Tag,
} from '@/components';
import { isAutomaticInstruction } from '@/domain';
import { categoryTones } from '@/features/instructions/categories';
import { DetailSection } from '@/features/instructions/DetailSection';
import { useActingInstructions } from '@/features/instructions/hooks';
import { useInstructionSelection } from '@/features/instructions/useInstructionSelection';
import { usePlayback } from '@/hooks';
import { useColors } from '@/theme';

// Script, acting instructions and an audio sample for one library entry.
// Read from the cached library list, so it opens without a request.
export default function InstructionDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const library = useActingInstructions();
  const { selectLibrary } = useInstructionSelection();
  const playback = usePlayback();
  const item = library.data?.find(entry => entry.id === id);

  if (library.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }
  if (!item) {
    return (
      <View className="flex-1 pt-2">
        <ScreenHeader />
        <EmptyState icon="help" title={t('instructions.notFound')} />
      </View>
    );
  }

  const active = playback.activeId === item.id;
  const playing = active && playback.playing;
  const automatic = isAutomaticInstruction(item);

  return (
    <View className="gap-6 pb-6 pt-2">
      <ScreenHeader
        title={item.name}
        titleAccessory={
          item.category ? (
            <Tag
              label={t(`instructions.categories.${item.category}`)}
              tone={categoryTones[item.category]}
            />
          ) : null
        }
      />

      <DetailSection
        title={t('instructions.detail.script')}
        icon="files"
        tone="blue"
      >
        <AppText variant="body" className="text-ink">
          {item.sampleScript}
        </AppText>
      </DetailSection>

      <DetailSection
        title={t('instructions.detail.instructions')}
        icon={automatic ? 'sparkles' : 'clipboard'}
        tone="pink"
      >
        <AppText variant="body" className="text-ink">
          {item.instructions}
        </AppText>
      </DetailSection>

      {!automatic ? (
        <DetailSection
          title={t('instructions.detail.sample')}
          icon="volume"
          tone="cyan"
        >
          <View className="flex-row items-center gap-4">
            <GradientPlayButton
              active={active}
              playing={playing}
              loading={active && playback.loading}
              player={playback.player}
              disabled={!item.sampleAudioUrl}
              onPress={() =>
                playback.toggle({ id: item.id, audioUrl: item.sampleAudioUrl })
              }
              accessibilityLabel={t(playing ? 'instructions.pause' : 'instructions.play', {
                name: item.name,
              })}
            />
            <AppText variant="body" className="flex-1 text-ink">
              {item.sampleAudioUrl
                ? t('instructions.detail.playSample')
                : t('instructions.detail.noSample')}
            </AppText>
          </View>
        </DetailSection>
      ) : null}

      <Button
        label={t('instructions.detail.use')}
        onPress={() => selectLibrary(item)}
      />
    </View>
  );
}
