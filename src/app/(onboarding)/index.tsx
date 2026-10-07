// Route: / (first launch, before onboarding is completed)
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { MarqueeRow } from '@/features/onboarding/MarqueeRow';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { sampleRows, samplesById } from '@/features/onboarding/voicesDemo';
import { usePlayback } from '@/hooks';

// Marquee speed per row, in dp per second (rows drift at slightly
// different paces so they never line up).
const ROW_SPEEDS = [19, 16, 17, 15, 18];

// Step 1: "AI voices that actually act." Rows of Acting Instruction pills
// drift past; tapping one plays its sample.
export default function OnboardingVoicesScreen() {
  const router = useRouter();
  const { activeId, playing, toggle, stop } = usePlayback();
  // Only show the bars while audio is actually going (not after a pause).
  const playingId = playing ? activeId : null;

  const onPill = useCallback(
    (id: string) => {
      const sample = samplesById.get(id);
      if (!sample) {
        return;
      }
      if (id === playingId) {
        stop();
      } else {
        toggle(sample);
      }
    },
    [playingId, stop, toggle],
  );

  const onNext = () => {
    stop();
    router.push('/direct');
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
            onPress={onPill}
          />
        ))}
      </View>
    </OnboardingStep>
  );
}
