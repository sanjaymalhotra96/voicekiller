import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText, AudioClip, Button, SelectField, MediaPanel, MediaPanelHeader } from '@/components';
import type { useVoiceRecorder } from '@/features/voice-clone/useVoiceRecorder';
import { formatDuration } from '@/utils';

type Props = {
  recorder: ReturnType<typeof useVoiceRecorder>;
  onPickMicrophone: () => void;
};

// "Record your voice": Record / Stop, microphone choice, then the take
// with "Record Again".
export function RecordPanel({ recorder, onPickMicrophone }: Props) {
  const { t } = useTranslation();
  const { uri, isRecording, elapsedSeconds, inputs, inputId } = recorder;
  const microphone = inputs.find(input => input.uid === inputId)?.name;
  const clipName = t('voiceClone.record.fileName');

  return (
    <MediaPanel>
      <MediaPanelHeader
        icon="mic"
        title={t('voiceClone.record.title')}
        hint={
          isRecording
            ? t('voiceClone.record.recording', { time: formatDuration(elapsedSeconds) })
            : t('voiceClone.record.hint')
        }
        action={
          isRecording ? (
            <Button
              size="sm"
              variant="danger"
              label={t('voiceClone.record.stop')}
              onPress={recorder.stop}
            />
          ) : uri ? null : (
            <Button
              size="sm"
              variant="light"
              label={t('voiceClone.record.action')}
              onPress={recorder.start}
            />
          )
        }
      />

      {uri && !isRecording ? (
        <>
          <View className="border-t border-night-line pt-4">
            <AudioClip
              uri={uri}
              name={clipName}
              playLabel={t('voiceClone.clip.play', { name: clipName })}
              pauseLabel={t('voiceClone.clip.pause', { name: clipName })}
            />
          </View>
          <Button
            size="sm"
            variant="nightOutline"
            label={t('voiceClone.record.again')}
            onPress={recorder.discard}
          />
        </>
      ) : (
        <View className="gap-2 border-t border-night-line pt-4">
          <AppText variant="caption" className="text-night-subtle">
            {t('voiceClone.record.microphone')}
          </AppText>
          <SelectField
            tone="night"
            size="sm"
            chevron="down"
            value={microphone ?? t('voiceClone.record.defaultMicrophone')}
            placeholder={t('voiceClone.record.defaultMicrophone')}
            accessibilityLabel={t('voiceClone.record.microphone')}
            onPress={onPickMicrophone}
          />
        </View>
      )}
    </MediaPanel>
  );
}
