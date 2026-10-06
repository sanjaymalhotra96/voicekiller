// Route: /speech-to-text
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Button,
  FormError,
  LanguageField,
  ScreenHeader,
  UploadSlot,
} from '@/components';
import { config } from '@/config';
import {
  fileRules,
  LanguageId,
  maxMegabytes,
  TranslationLanguageId,
  translationLanguageIds,
} from '@/domain';
import { useLibraryJob } from '@/features/results/hooks';
import { ResultsView } from '@/features/results/ResultsView';
import { TranscriptSheet } from '@/features/speech-to-text/TranscriptSheet';
import { useStatusBarStyle, useUnmountSignal, useUploadSlot } from '@/hooks';
import {
  speechToTextService,
  TranscriptionSession,
} from '@/services/speechToText';

const rules = fileRules.transcription;

// "harvard.wav" -> "harvard" for exported subtitle files.
const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'transcript';

// Transcribe audio, optionally translated into subtitles.
export default function SpeechToTextScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules);
  // Leaving the screen stops the upload and the wait; the server still
  // finishes and saves the transcript in Library.
  const unmountSignal = useUnmountSignal();
  const [language, setLanguage] = useState<LanguageId>(
    config.defaultLanguage as LanguageId,
  );
  const [translateTo, setTranslateTo] = useState<TranslationLanguageId | null>(null);
  // The server saves the transcript as a Library file when it is done.
  const transcribe = useLibraryJob(speechToTextService.transcribe);
  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const fileName =
    'file' in source.state ? baseName(source.state.file.name) : 'transcript';

  const start = () => {
    if (source.file) {
      transcribe.mutate(
        {
          file: source.file,
          language,
          translateTo,
          onProgress: source.showProgress,
          signal: unmountSignal(),
        },
        { onSuccess: setSession, onError: () => source.showProgress(null) },
      );
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('speechToText.title')} />

      <UploadSlot
        state={source.state}
        title={t('upload.source')}
        hint={t('upload.maxSize', { max: maxMegabytes(rules) })}
        onPick={source.pick}
        onRemove={source.remove}
      />

      <LanguageField
        label={t('speechToText.language')}
        value={language}
        onChange={value => value && setLanguage(value)}
      />
      <LanguageField
        label={t('speechToText.translation')}
        value={translateTo}
        onChange={setTranslateTo}
        noneLabel={t('speechToText.noTranslation')}
        languages={translationLanguageIds}
      />

      <FormError error={source.error ?? transcribe.error} />

      <Button
        label={t('speechToText.submit')}
        loading={transcribe.isPending}
        disabled={!source.file}
        onPress={start}
      />

      <ResultsView tool="speechToText" mode="recent" />

      <TranscriptSheet
        session={session}
        textLanguage={translateTo ?? language}
        fileName={fileName}
        onClose={() => setSession(null)}
        onSaved={() => {
          setSession(null);
          source.reset();
        }}
      />
    </View>
  );
}
