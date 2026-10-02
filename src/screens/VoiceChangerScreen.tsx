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
import { config } from '@/config';
import { fileRules, formatExtensions, maxMegabytes } from '@/domain';
import { ResultsView, useLibraryJob } from '@/features/results';
import { useStatusBarStyle, useUploadSlot } from '@/hooks';
import { voiceChangerService } from '@/services/mediaTools';

const rules = fileRules.changer;

// Speak in another voice: source speech + target voice sample.
export function VoiceChangerScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const source = useUploadSlot(rules, config.media.sourceBucket);
  const target = useUploadSlot(rules, config.media.sourceBucket);
  const convert = useLibraryJob(voiceChangerService.convert);
  const hint = t('upload.formats', {
    formats: formatExtensions(rules),
    max: maxMegabytes(rules),
  });

  const submit = () => {
    if (source.path && target.path) {
      convert.mutate(
        { sourcePath: source.path, targetPath: target.path },
        {
          onSuccess: () => {
            source.reset();
            target.reset();
          },
        },
      );
    }
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader tone="night" title={t('changer.title')} />

      <View className="gap-2">
        <FieldLabel label={t('changer.source')} required tone="night" />
        <UploadSlot
          state={source.state}
          title={t('upload.source')}
          hint={hint}
          onPick={source.pick}
          onRemove={source.remove}
        />
      </View>

      <View className="gap-2">
        <FieldLabel label={t('changer.target')} required tone="night" />
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
        label={t('changer.submit')}
        loading={convert.isPending}
        disabled={!source.path || !target.path}
        onPress={submit}
      />

      <ResultsView tool="voiceChanger" mode="recent" />
    </View>
  );
}
