// Route: /voice-changer
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Button,
  FieldLabel,
  FormError,
  ScreenHeader,
  UploadSlot,
} from '@/components';
import { fileRules, maxMegabytes } from '@/domain';
import { useLibraryJob } from '@/features/results/hooks';
import { ResultsView } from '@/features/results/ResultsView';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import { voiceChangerService } from '@/services/voiceChanger';

const rules = fileRules.changer;

// Speak in another voice: source speech + target voice sample.
export default function VoiceChangerScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules);
  const target = useUploadSlot(rules);
  const convert = useLibraryJob(voiceChangerService.convert);
  const hint = t('upload.maxSize', { max: maxMegabytes(rules) });

  const submit = () => {
    if (!source.file || !target.file) {
      return;
    }
    // Both files go up in one request: both rings show its progress.
    const showProgress = (ratio: number | null) => {
      source.showProgress(ratio);
      target.showProgress(ratio);
    };
    convert.mutate(
      { source: source.file, target: target.file, onProgress: showProgress },
      {
        onSuccess: () => {
          source.reset();
          target.reset();
        },
        onError: () => showProgress(null),
      },
    );
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('voiceChanger.title')} />

      <View className="gap-2">
        <FieldLabel label={t('voiceChanger.source')} required tone="night" />
        <UploadSlot
          state={source.state}
          title={t('upload.source')}
          hint={hint}
          onPick={source.pick}
          onRemove={source.remove}
        />
      </View>

      <View className="gap-2">
        <FieldLabel label={t('voiceChanger.target')} required tone="night" />
        <UploadSlot
          state={target.state}
          title={t('upload.target')}
          hint={hint}
          onPick={target.pick}
          onRemove={target.remove}
        />
      </View>

      <FormError error={source.error ?? target.error ?? convert.error} />

      <Button
        label={t('voiceChanger.submit')}
        loading={convert.isPending}
        disabled={!source.file || !target.file}
        onPress={submit}
      />

      <ResultsView tool="voiceChanger" mode="recent" />
    </View>
  );
}
