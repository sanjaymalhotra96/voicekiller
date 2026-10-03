// Route: /audio-clean
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  Button,
  FormError,
  ScreenHeader,
  ToggleRow,
  UploadSlot,
} from '@/components';
import { config } from '@/config';
import { fileRules, maxMegabytes } from '@/domain';
import { useLibraryJob } from '@/features/results/hooks';
import { ResultsView } from '@/features/results/ResultsView';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import { audioCleanService } from '@/services/mediaTools';

const rules = fileRules.media;

// Remove noise, optionally enhance to studio quality.
export default function AudioCleanScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules, config.media.sourceBucket);
  const [enhance, setEnhance] = useState(false);
  const clean = useLibraryJob(audioCleanService.clean);

  const submit = () => {
    if (source.path) {
      clean.mutate(
        { sourcePath: source.path, enhance },
        { onSuccess: source.reset },
      );
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('audioClean.title')} />

      <AppText variant="body" className="-mb-2 text-night-subtle">
        {t('audioClean.description')}
      </AppText>

      <UploadSlot
        state={source.state}
        title={t('upload.source')}
        hint={t('upload.maxSize', { max: maxMegabytes(rules) })}
        onPick={source.pick}
        onRemove={source.remove}
      />

      <ToggleRow
        tone="night"
        label={t('audioClean.enhance')}
        value={enhance}
        onChange={setEnhance}
      />

      <FormError error={source.error ?? clean.error} />

      <Button
        label={t('audioClean.submit')}
        loading={clean.isPending}
        disabled={!source.path}
        onPress={submit}
      />

      <ResultsView tool="audioClean" mode="recent" />
    </View>
  );
}
