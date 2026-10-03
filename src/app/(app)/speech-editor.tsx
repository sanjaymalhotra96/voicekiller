// Route: /speech-editor
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, FormError, ScreenHeader, UploadSlot } from '@/components';
import { config } from '@/config';
import { fileRules, maxMegabytes } from '@/domain';
import { EditorSheet } from '@/features/speech-editor/EditorSheet';
import { ResultsView } from '@/features/results/ResultsView';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import { EditorSession, speechEditorService } from '@/services/mediaTools';

const rules = fileRules.media;

// Fix the words in a recording: transcribe, edit the text, regenerate.
export default function SpeechEditorScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules, config.media.sourceBucket);
  const transcribe = useMutation({ mutationFn: speechEditorService.transcribe });
  const [session, setSession] = useState<EditorSession | null>(null);

  const start = () => {
    if (source.path) {
      transcribe.mutate({ sourcePath: source.path }, { onSuccess: setSession });
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('speechEditor.title')} />

      <UploadSlot
        state={source.state}
        title={t('upload.source')}
        hint={t('upload.maxSize', { max: maxMegabytes(rules) })}
        onPick={source.pick}
        onRemove={source.remove}
      />

      <FormError error={source.error ?? transcribe.error} />

      <Button
        label={t('speechEditor.submit')}
        loading={transcribe.isPending}
        disabled={!source.path}
        onPress={start}
      />

      <ResultsView tool="speechEditor" mode="recent" />

      <EditorSheet
        session={session}
        onClose={() => setSession(null)}
        onSaved={() => {
          setSession(null);
          source.reset();
        }}
      />
    </View>
  );
}
