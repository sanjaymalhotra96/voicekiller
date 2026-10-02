import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { capabilitiesOf } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import { ToolbarChip } from '@/features/text-to-speech/ToolbarChip';
import type { EditorSheet } from '@/features/text-to-speech/types';

type Props = {
  onOpen: (sheet: EditorSheet) => void;
};

// Voice, Emotions (when the voice supports them), Add Pause, Settings.
export function EditorToolbar({ onOpen }: Props) {
  const { t } = useTranslation();
  const voice = useSpeechDraft(state => state.voice);
  const can = capabilitiesOf(voice);

  return (
    <View className="flex-row items-center justify-end gap-2">
      <ToolbarChip
        tone="accent"
        icon="voice"
        label={voice?.name ?? t('speech.chooseVoice')}
        chevron
        accessibilityLabel={
          voice
            ? t('speech.voiceLabel', { name: voice.name })
            : t('speech.chooseVoice')
        }
        onPress={() => onOpen('voice')}
      />
      {can.emotions ? (
        <ToolbarChip
          icon="emotion"
          label={t('speech.emotions')}
          badge={t('common.beta')}
          accessibilityLabel={t('speech.emotions')}
          onPress={() => onOpen('emotion')}
        />
      ) : null}
      <ToolbarChip
        icon="pause"
        label={t('speech.addPause')}
        accessibilityLabel={t('speech.addPause')}
        onPress={() => onOpen('pause')}
      />
      <ToolbarChip
        icon="settings"
        accessibilityLabel={t('speech.settings')}
        onPress={() => onOpen('settings')}
      />
    </View>
  );
}
