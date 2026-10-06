import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  BottomSheet,
  RulerSlider,
  SegmentedControl,
  SelectField,
  StepSlider,
  TextArea,
} from '@/components';
import {
  audioFormats,
  capabilitiesOf,
  deliveryModes,
  formatSpeed,
  snapSpeed,
  speedPresets,
  speedRange,
  textLimits,
} from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import type { EditorSheetProps } from '@/features/text-to-speech/types';

type Props = EditorSheetProps & {
  // Opens the Acting Instruction screen (the sheet closes first).
  onBrowseInstructions: () => void;
};

function Heading({ children }: { children: string }) {
  return (
    <AppText variant="overline" className="font-sans text-ink-subtle">
      {children}
    </AppText>
  );
}

// Output format plus whatever the selected voice can be tuned with:
// speed and delivery, and/or acting instructions.
export function SpeechSettingsSheet({
  visible,
  onClose,
  onBrowseInstructions,
}: Props) {
  const { t } = useTranslation();
  const voice = useSpeechDraft(state => state.voice);
  const settings = useSpeechDraft(state => state.settings);
  const updateSettings = useSpeechDraft(state => state.updateSettings);
  const instruction = useSpeechDraft(state => state.instruction);
  const instructionText = useSpeechDraft(state => state.instructionText);
  const setInstructionText = useSpeechDraft(state => state.setInstructionText);
  const can = capabilitiesOf(voice);
  const speedLimits = can.speed;
  // Quick picks the voice can use.
  const presets = useMemo(
    () =>
      speedLimits
        ? speedPresets.filter(
            speed => speed >= speedLimits.min && speed <= speedLimits.max,
          )
        : [],
    [speedLimits],
  );

  const formats = useMemo(
    () => audioFormats.map(key => ({ key, label: t(`textToSpeech.formats.${key}`) })),
    [t],
  );
  const deliverySteps = useMemo(
    () => deliveryModes.map(key => ({ key, label: t(`textToSpeech.delivery.${key}`) })),
    [t],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('textToSpeech.settingsSheet.title')}
    >
      <View className="gap-6">
        <View className="gap-3">
          <Heading>{t('textToSpeech.settingsSheet.audioFormat')}</Heading>
          <SegmentedControl
            variant="cards"
            segments={formats}
            value={settings.format}
            onChange={format => updateSettings({ format })}
          />
        </View>

        {can.speed || can.delivery ? (
          <View className="gap-4">
            <Heading>{t('textToSpeech.settingsSheet.voiceTuning')}</Heading>
            {speedLimits ? (
              <>
                <AppText variant="label">{t('textToSpeech.settingsSheet.speed')}</AppText>
                <RulerSlider
                  {...speedRange}
                  {...speedLimits}
                  value={snapSpeed(settings.speed, speedLimits)}
                  onChange={speed => updateSettings({ speed })}
                  snap={value => snapSpeed(value, speedLimits)}
                  format={formatSpeed}
                  presets={presets}
                  accessibilityLabel={t('textToSpeech.settingsSheet.speed')}
                />
              </>
            ) : null}
            {can.delivery ? (
              <>
                <AppText variant="label" className={can.speed ? 'mt-2' : undefined}>
                  {t('textToSpeech.settingsSheet.delivery')}
                </AppText>
                <StepSlider
                  steps={deliverySteps}
                  value={settings.delivery}
                  onChange={delivery => updateSettings({ delivery })}
                />
              </>
            ) : null}
          </View>
        ) : null}

        {can.actingInstructions ? (
          <View className="gap-3">
            <Heading>{t('textToSpeech.settingsSheet.actingInstructions')}</Heading>
            <AppText variant="label">
              {t('textToSpeech.settingsSheet.instruction')}
            </AppText>
            <SelectField
              tone="outline"
              value={instruction?.name}
              placeholder={t('textToSpeech.settingsSheet.chooseInstruction')}
              accessibilityLabel={t('textToSpeech.settingsSheet.instruction')}
              onPress={onBrowseInstructions}
            />
            <TextArea
              tone="muted"
              label={t('textToSpeech.settingsSheet.ownInstructions')}
              placeholder={t('textToSpeech.settingsSheet.ownPlaceholder')}
              value={instructionText}
              onChangeText={setInstructionText}
              maxLength={textLimits.instructionPrompt}
              boxClassName="h-textarea"
              className="mt-2"
            />
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
