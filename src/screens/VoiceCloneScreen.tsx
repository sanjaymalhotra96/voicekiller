import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Banner,
  Button,
  FormError,
  LanguageField,
  OptionSheet,
  ScreenHeader,
  SegmentedControl,
  StatusPill,
  TextField,
  TipsSheet,
} from '@/components';
import { config } from '@/config';
import {
  AudioSample,
  CloneSource,
  cloneSources,
  fileRules,
  LanguageId,
  textLimits,
} from '@/domain';
import {
  RecordPanel,
  UploadPanel,
  useCreateClone,
  useVoiceRecorder,
} from '@/features/voice-clone';
import { resultsRoute } from '@/features/results';
import { useFilePicker, useStatusBarStyle } from '@/hooks';

export function VoiceCloneScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageId>(
    config.defaultLanguage as LanguageId,
  );
  const [name, setName] = useState('');
  const [source, setSource] = useState<CloneSource>('upload');
  const [sheet, setSheet] = useState<'microphone' | 'guide' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const picker = useFilePicker(fileRules.clone);
  const recorder = useVoiceRecorder(config.clone.maxRecordSeconds);
  const create = useCreateClone();
  const closeSheet = () => setSheet(null);

  // Opening Record asks for the microphone and lists inputs; leaving it
  // stops any recording in progress.
  const { prepare, stop } = recorder;
  useEffect(() => {
    if (source === 'record') {
      prepare();
    } else {
      stop();
    }
  }, [source, prepare, stop]);

  const sample: AudioSample | null =
    source === 'upload'
      ? picker.sample
      : recorder.uri
      ? {
          uri: recorder.uri,
          name: t('clone.record.fileName'),
          mimeType: 'audio/m4a',
          size: null,
        }
      : null;

  const sourceTabs = useMemo(
    () => cloneSources.map(key => ({ key, label: t(`clone.sources.${key}`) })),
    [t],
  );
  const microphoneOptions = useMemo(
    () => recorder.inputs.map(input => ({ key: input.uid, label: input.name })),
    [recorder.inputs],
  );
  const tips = t('clone.guideSheet.tips', { returnObjects: true });

  const trimmedName = name.trim();
  const submit = () => {
    setSubmitted(true);
    if (!trimmedName || !sample || recorder.isRecording) {
      return;
    }
    create.mutate(
      { name: trimmedName, language, sample },
      { onSuccess: () => router.replace(resultsRoute('voiceClone')) },
    );
  };

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader
        tone="night"
        title={t('clone.title')}
        trailing={
          <StatusPill
            icon="info"
            label={t('clone.guide')}
            onPress={() => setSheet('guide')}
          />
        }
      />

      <LanguageField
        label={t('clone.language')}
        value={language}
        onChange={value => value && setLanguage(value)}
      />

      <TextField
        tone="night"
        required
        label={t('clone.voiceName')}
        placeholder={t('clone.voiceNamePlaceholder')}
        value={name}
        onChangeText={setName}
        maxLength={textLimits.voiceName}
        error={
          submitted && !trimmedName ? t('validation.voiceNameRequired') : undefined
        }
        returnKeyType="done"
      />

      <SegmentedControl
        variant="night"
        segments={sourceTabs}
        value={source}
        onChange={setSource}
      />

      {source === 'upload' ? (
        <UploadPanel sample={picker.sample} onPick={picker.pick} />
      ) : (
        <RecordPanel
          recorder={recorder}
          onPickMicrophone={() => setSheet('microphone')}
        />
      )}

      {submitted && !sample ? (
        <Banner message={t('validation.sampleRequired')} />
      ) : null}
      <FormError
        error={(source === 'upload' ? picker.error : recorder.error) ?? create.error}
      />

      <Button
        icon="micSparkle"
        label={t('clone.submit')}
        loading={create.isPending}
        disabled={recorder.isRecording}
        onPress={submit}
      />

      <OptionSheet
        visible={sheet === 'microphone'}
        onClose={closeSheet}
        title={t('clone.record.microphone')}
        options={microphoneOptions}
        value={recorder.inputId}
        onSelect={recorder.selectInput}
      />
      <TipsSheet
        visible={sheet === 'guide'}
        onClose={closeSheet}
        title={t('clone.guideSheet.title')}
        tips={tips}
      />
    </View>
  );
}
