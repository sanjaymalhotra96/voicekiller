// Route: /clean (onboarding step 5)
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from '@/components';
import {
  cleanAudioUrl,
  cleanWave,
  noisyAudioUrl,
  noisyWave,
} from '@/features/onboarding/cleanDemo';
import { CleanSwitch } from '@/features/onboarding/CleanSwitch';
import { EqualizerBars } from '@/features/onboarding/EqualizerBars';
import { OnboardingCard } from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { TakeButton } from '@/features/onboarding/TakeButton';
import { useCrossfadePair } from '@/features/onboarding/useCrossfadePair';
import { palette } from '@/theme';
import { cn } from '@/utils';

// Step 5: "Bad audio? Fixed in one tap." One recording plays; the switch
// crossfades between the noisy original and the cleaned version.
export default function OnboardingCleanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const pair = useCrossfadePair(noisyAudioUrl, cleanAudioUrl);
  const clean = pair.useB;

  const onNext = () => {
    pair.pause();
    router.push('/edit');
  };

  return (
    <OnboardingStep
      step={5}
      titleKey="onboarding.clean.title"
      subtitleKey="onboarding.clean.subtitle"
      onNext={onNext}
    >
      <OnboardingCard tone="canvas">
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className={cn(
            'h-wave-box items-center justify-center overflow-hidden rounded-panel',
            clean ? 'bg-primary-wash' : 'bg-field',
          )}
        >
          <EqualizerBars
            heights={clean ? cleanWave : noisyWave}
            color={clean ? palette.primary.DEFAULT : palette.ink.inactive}
            gap={4}
            barWidth={4}
            animated={pair.playing}
          />
        </View>

        <TakeButton
          phase={pair.playing ? 'playing' : 'idle'}
          labels={{
            idle: t('onboarding.clean.play'),
            loading: t('onboarding.clean.play'),
            playing: t('onboarding.clean.pause'),
          }}
          stopLabel={t('onboarding.clean.pause')}
          idleIcon="play"
          onPress={pair.playing ? pair.pause : pair.play}
        />

        <CleanSwitch clean={clean} onChange={pair.setUseB} />
        <AppText variant="caption" className="mt-1.5 text-center text-sm">
          {t('onboarding.clean.hint')}
        </AppText>
      </OnboardingCard>
    </OnboardingStep>
  );
}
