import React, { MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { TextArea } from '@/components';
import { TextSelection, textLimits } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';

type Props = {
  // Latest cursor/selection, kept in a ref: tracking it must not re-render.
  selectionRef: MutableRefObject<TextSelection>;
};

// The script box. It is the only part of the editor that subscribes to
// the script text, so typing re-renders this box and nothing else.
export function ScriptInput({ selectionRef }: Props) {
  const { t } = useTranslation();
  const script = useSpeechDraft(state => state.script);
  const setScript = useSpeechDraft(state => state.setScript);

  return (
    <TextArea
      tone="night"
      accessibilityLabel={t('speech.scriptLabel')}
      placeholder={t('speech.scriptPlaceholder')}
      value={script}
      onChangeText={setScript}
      onSelectionChange={event => {
        selectionRef.current = event.nativeEvent.selection;
      }}
      maxLength={textLimits.script}
      showCount
      scrollEnabled
      className="flex-1"
      boxClassName="flex-1"
    />
  );
}
