import React, { MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { TextArea } from '@/components';
import { speechRulesFor, TextSelection } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';

type Props = {
  // Latest cursor/selection, kept in a ref: tracking it must not re-render.
  selectionRef: MutableRefObject<TextSelection>;
};

// The script box. It is the only part of the editor that subscribes to
// the script text and selected voice's character limit.
export function ScriptInput({ selectionRef }: Props) {
  const { t, i18n } = useTranslation();
  const script = useSpeechDraft(state => state.script);
  const setScript = useSpeechDraft(state => state.setScript);
  const voice = useSpeechDraft(state => state.voice);
  const { scriptLimit } = speechRulesFor(voice);

  return (
    <TextArea
      tone="night"
      accessibilityLabel={t('textToSpeech.scriptLabel')}
      placeholder={t('textToSpeech.scriptPlaceholder')}
      value={script}
      onChangeText={setScript}
      onSelectionChange={event => {
        selectionRef.current = event.nativeEvent.selection;
      }}
      maxLength={scriptLimit}
      error={
        script.length > scriptLimit
          ? t('textToSpeech.scriptLimitExceeded', {
              max: scriptLimit.toLocaleString(i18n.language),
            })
          : undefined
      }
      showCount
      scrollEnabled
      className="flex-1"
      boxClassName="flex-1"
    />
  );
}
