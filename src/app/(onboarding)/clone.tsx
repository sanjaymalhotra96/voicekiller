// Route: /clone (onboarding step 3)
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { FormError, TextArea } from '@/components';
import { textLimits } from '@/domain';
import {
  cloneTakeKey,
  cloneVoices,
  defaultCloneScript,
} from '@/features/onboarding/cloneDemo';
import {
  CardLabel,
  OnboardingCard,
} from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { TakeButton } from '@/features/onboarding/TakeButton';
import { useGeneratedTake } from '@/features/onboarding/useGeneratedTake';
import { VoiceSampleOption } from '@/features/onboarding/VoiceSampleOption';
import { generateOnboardingClone } from '@/services/onboarding';

// Real-voice clips share the player with clone takes, under their own ids.
const realId = (voiceId: string) => `real:${voiceId}`;

// Step 3: "Clone a voice in seconds." Select a voice or preview its sample,
// then type a line and hear the selected clone say it.
export default function OnboardingCloneScreen() {
  const { t } = useTranslation();
  const [voice, setVoice] = useState(cloneVoices[0]);
  const [script, setScript] = useState(defaultCloneScript);
  const { phase, playingId, loadingId, error, play, playClip, reset } =
    useGeneratedTake();

  const onVoice = useCallback(
    (id: string) => {
      const next = cloneVoices.find(item => item.id === id);
      if (!next || next.id === voice.id) return;
      reset();
      setVoice(next);
    },
    [reset, voice.id],
  );

  const onPreview = useCallback(
    (id: string) => {
      const next = cloneVoices.find(item => item.id === id);
      if (!next) {
        return;
      }
      if (playingId === realId(id)) {
        reset();
      } else {
        playClip(realId(id), next.sample);
      }
    },
    [playClip, playingId, reset],
  );

  const onEdit = (text: string) => {
    if (phase !== 'idle') {
      reset();
    }
    setScript(text);
  };

  const onTake = () => {
    if (phase === 'playing') {
      reset();
      return;
    }
    const text = script.trim();
    const { voiceId } = voice;
    play(cloneTakeKey(voice, text), signal =>
      generateOnboardingClone(text, voiceId, signal),
    );
  };

  const onNext = (go: (name: string) => void) => {
    reset();
    go('change');
  };

  const name = voice.name;
  return (
    <OnboardingStep
      step={3}
      titleKey="onboarding.clone.title"
      subtitleKey="onboarding.clone.subtitle"
      onNext={onNext}
    >
      <View className="mt-6 flex-row flex-wrap gap-2">
        {cloneVoices.map(item => {
          const sounding = playingId === realId(item.id);
          return (
            <VoiceSampleOption
              key={item.id}
              id={item.id}
              name={item.name}
              loading={loadingId === realId(item.id)}
              selectionLabel={t('onboarding.clone.selectVoice', {
                name: item.name,
              })}
              previewLabel={t(
                sounding
                  ? 'onboarding.clone.stopReal'
                  : 'onboarding.clone.playReal',
                { name: item.name },
              )}
              playing={sounding}
              selected={item.id === voice.id}
              onSelect={onVoice}
              onPreview={onPreview}
            />
          );
        })}
      </View>

      <OnboardingCard tone="canvas" className="mt-5">
        <CardLabel>{t('onboarding.clone.lineLabel')}</CardLabel>
        <TextArea
          accessibilityLabel={t('onboarding.clone.lineLabel')}
          value={script}
          onChangeText={onEdit}
          maxLength={textLimits.onboardingCloneScript}
          showCount
          placeholder={t('onboarding.clone.linePlaceholder')}
          boxClassName="h-28"
          className="mt-2"
        />
        <TakeButton
          phase={phase}
          labels={{
            idle: t('onboarding.clone.play'),
            loading: t('onboarding.clone.cloning', { name }),
            playing: t('onboarding.clone.playing', { name }),
          }}
          idleIcon="play"
          disabled={!script.trim()}
          onPress={onTake}
        />
        <FormError error={error} className="mt-3" />
      </OnboardingCard>
    </OnboardingStep>
  );
}
