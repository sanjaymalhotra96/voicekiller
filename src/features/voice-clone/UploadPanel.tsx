import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AudioClip, Button, MediaPanel, MediaPanelHeader } from '@/components';
import { config } from '@/config';
import type { AudioSample } from '@/domain';

type Props = {
  sample: AudioSample | null;
  onPick: () => void;
};

// "Upload Source Audio": pick a file; once picked, preview it in place.
export function UploadPanel({ sample, onPick }: Props) {
  const { t } = useTranslation();
  const uploadButton = (
    <Button
      size="sm"
      variant="light"
      label={t('voiceClone.upload.action')}
      onPress={onPick}
    />
  );

  return (
    <MediaPanel>
      {sample ? (
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <AudioClip
              uri={sample.uri}
              name={sample.name}
              playLabel={t('voiceClone.clip.play', { name: sample.name })}
              pauseLabel={t('voiceClone.clip.pause', { name: sample.name })}
            />
          </View>
          {uploadButton}
        </View>
      ) : (
        <MediaPanelHeader
          icon="upload"
          title={t('voiceClone.upload.title')}
          hint={t('voiceClone.upload.hint', { seconds: config.clone.sampleSeconds })}
          action={uploadButton}
        />
      )}
    </MediaPanel>
  );
}
