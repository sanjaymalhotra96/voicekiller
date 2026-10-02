import { useMutation } from '@tanstack/react-query';
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
  formatExtensions,
  LanguageId,
  maxMegabytes,
} from '@/domain';
import { ResultsView } from '@/features/results';
import { TranscriptSheet } from '@/features/speech-to-text';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import {
  speechToTextService,
  TranscriptionSession,
} from '@/services/mediaTools';

const rules = fileRules.media;

// "harvard.wav" -> "harvard" for exported subtitle files.
const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'transcript';

// Transcribe audio, optionally translated into subtitles.
export function SpeechToTextScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules, config.media.sourceBucket);
  const [language, setLanguage] = useState<LanguageId>(
    config.defaultLanguage as LanguageId,
  );
  const [translateTo, setTranslateTo] = useState<LanguageId | null>(null);
  const transcribe = useMutation({ mutationFn: speechToTextService.transcribe });
  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const fileName =
    source.state.status === 'idle' ? 'transcript' : baseName(source.state.file.name);

  const start = () => {
    if (source.path) {
      transcribe.mutate(
        { sourcePath: source.path, language, translateTo },
        { onSuccess: setSession },
      );
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('stt.title')} />

      <UploadSlot
        state={source.state}
        title={t('upload.source')}
        hint={t('upload.formats', {
          formats: formatExtensions(rules),
          max: maxMegabytes(rules),
        })}
        onPick={source.pick}
        onRemove={source.remove}
      />

      <LanguageField
        label={t('stt.language')}
        value={language}
        onChange={value => value && setLanguage(value)}
      />
      <LanguageField
        label={t('stt.translation')}
        value={translateTo}
        onChange={setTranslateTo}
        noneLabel={t('stt.noTranslation')}
      />

      <FormError error={source.error ?? transcribe.error} />

      <Button
        label={t('stt.submit')}
        loading={transcribe.isPending}
        disabled={!source.path}
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
