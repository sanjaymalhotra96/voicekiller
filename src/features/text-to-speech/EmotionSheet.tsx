import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, BottomSheet, OptionList } from '@/components';
import { emotionIds } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import type { EditorSheetProps } from '@/features/text-to-speech/types';

// Emotion for the whole script (expressive voices only).
export function EmotionSheet({ visible, onClose }: EditorSheetProps) {
  const { t } = useTranslation();
  const emotion = useSpeechDraft(state => state.emotion);
  const setEmotion = useSpeechDraft(state => state.setEmotion);
  const options = useMemo(
    () => emotionIds.map(id => ({ key: id, label: t(`emotions.${id}`) })),
    [t],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('textToSpeech.emotions')}
      titleAccessory={<Badge label={t('common.beta')} />}
    >
      <OptionList
        options={options}
        value={emotion}
        onSelect={id => {
          setEmotion(id);
          onClose();
        }}
      />
    </BottomSheet>
  );
}
