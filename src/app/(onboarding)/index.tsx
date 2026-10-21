// Route: / (first launch, before onboarding is completed)
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { MarqueeRow } from '@/features/onboarding/MarqueeRow';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useOnboardingPlayer } from '@/features/onboarding/useOnboardingPlayer';
import { sampleRows, samplesById } from '@/features/onboarding/voicesDemo';

// Marquee speed per row, in dp per second (rows drift at slightly
// different paces so they never line up).
const ROW_SPEEDS = [19, 16, 17, 15, 18];

// Step 1: "AI voices that actually act." Rows of Acting Instruction pills
// drift past; tapping one plays its sample.
export default function OnboardingVoicesScreen() {
  const { playingId, loadingId, playOrStop, stop } = useOnboardingPlayer();

  const onPill = useCallback(
    (id: string) => {
      const sample = samplesById.get(id);
      if (!sample) {
        return;
      }
      playOrStop(sample);
    },
    [playOrStop],
  );

  const onNext = (go: (name: string) => void) => {
    stop();
    go('direct');
  };

  return (
    <OnboardingStep
      step={1}
      titleKey="onboarding.voices.title"
      subtitleKey="onboarding.voices.subtitle"
      onNext={onNext}
      bleed
    >
      <View className="mt-2 flex-1 justify-center gap-3.5">
        {sampleRows.map((samples, i) => (
          <MarqueeRow
            key={i}
            index={i}
            samples={samples}
            speed={ROW_SPEEDS[i]}
            activeId={playingId}
            loadingId={loadingId}
            onPress={onPill}
          />
        ))}
      </View>
    </OnboardingStep>
  );
}
