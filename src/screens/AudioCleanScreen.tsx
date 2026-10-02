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
import { fileRules, formatExtensions, maxMegabytes } from '@/domain';
import { ResultsView, useLibraryJob } from '@/features/results';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import { audioCleanService } from '@/services/mediaTools';

const rules = fileRules.media;

// Remove noise, optionally enhance to studio quality.
export function AudioCleanScreen() {
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
      <ScreenHeader tone="night" title={t('clean.title')} />

      <AppText variant="body" className="-mb-2 text-night-subtle">
        {t('clean.description')}
      </AppText>

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

      <ToggleRow
        tone="night"
        label={t('clean.enhance')}
        value={enhance}
        onChange={setEnhance}
      />

      <FormError error={source.error ?? clean.error} />

      <Button
        label={t('clean.submit')}
        loading={clean.isPending}
        disabled={!source.path}
        onPress={submit}
      />

      <ResultsView tool="audioClean" mode="recent" />
    </View>
  );
}
