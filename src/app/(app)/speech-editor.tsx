// Route: /speech-editor
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, FormError, ScreenHeader, UploadSlot } from '@/components';
import { config } from '@/config';
import { fileRules, maxMegabytes } from '@/domain';
import { useLibraryJob } from '@/features/results/hooks';
import { EditorSheet } from '@/features/speech-editor/EditorSheet';
import { ResultsView } from '@/features/results/ResultsView';
import { useStatusBarStyle, useUnmountSignal, useUploadSlot } from '@/hooks';
import { EditorSession, speechEditorService } from '@/services/speechEditor';

const rules = fileRules.editor;

// Fix the words in a recording: transcribe, edit the text, regenerate.
export default function SpeechEditorScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  // The server takes up to 2 minutes: longer clips are cut to that.
  const source = useUploadSlot(rules, {
    maxSeconds: config.speechEditor.maxSeconds,
  });
  // Leaving the screen cancels an upload still in progress.
  const unmountSignal = useUnmountSignal();
  // The uploaded recording is saved as a Library file straight away.
  const transcribe = useLibraryJob(speechEditorService.transcribe);
  const [session, setSession] = useState<EditorSession | null>(null);

  const start = () => {
    if (source.file) {
      transcribe.mutate(
        { file: source.file, onProgress: source.showProgress, signal: unmountSignal() },
        { onSuccess: setSession, onError: () => source.showProgress(null) },
      );
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('speechEditor.title')} />

      <UploadSlot
        state={source.state}
        title={t('upload.source')}
        hint={t('speechEditor.uploadHint', {
          max: maxMegabytes(rules),
          minutes: config.speechEditor.maxSeconds / 60,
        })}
        onPick={source.pick}
        onRemove={source.remove}
      />

      <FormError error={source.error ?? transcribe.error} />

      <Button
        label={t('speechEditor.submit')}
        loading={transcribe.isPending}
        disabled={!source.file}
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
