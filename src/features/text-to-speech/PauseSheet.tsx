import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, OptionList } from '@/components';
import { PauseDuration, pauseDurations } from '@/domain';
import type { EditorSheetProps } from '@/features/text-to-speech/types';

type Props = EditorSheetProps & {
  // Inserts the pause at the cursor (the screen owns the selection).
  onInsert: (seconds: PauseDuration) => void;
};

// "Add pause": tap a length to insert a pause marker into the script.
export function PauseSheet({ visible, onClose, onInsert }: Props) {
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      pauseDurations.map(seconds => ({
        key: String(seconds),
        label: t('textToSpeech.pauseSheet.seconds', { count: seconds }),
      })),
    [t],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('textToSpeech.pauseSheet.title')}
    >
      <OptionList
        options={options}
        onSelect={key => {
          onInsert(Number(key) as PauseDuration);
          onClose();
        }}
      />
    </BottomSheet>
  );
}
