// Route: /change (onboarding step 4)
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components';
import {
  changerBeforeUrl,
  changerBeforeWave,
  ChangerVoice,
  changerVoices,
} from '@/features/onboarding/changeDemo';
import { CompareRow } from '@/features/onboarding/CompareRow';
import {
  CardLabel,
  OnboardingCard,
} from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useClipPlayer } from '@/features/onboarding/useClipPlayer';
import { useStatusBarStyle } from '@/hooks';
import { cn } from '@/utils';

const BEFORE_ID = 'before';
const afterId = (voice: ChangerVoice) => `after:${voice.id}`;

// The voice grid, two per row.
const voiceRows = [changerVoices.slice(0, 2), changerVoices.slice(2, 4)];

function VoiceOption({
  voice,
  selected,
  onPress,
}: {
  voice: ChangerVoice;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={voice.name}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'h-option flex-1 flex-row items-center gap-2 rounded-2xl px-3 active:opacity-80',
        selected ? 'bg-ink' : 'bg-field',
      )}
    >
      <View
        className={cn(
          'size-8 items-center justify-center rounded-full',
          selected ? 'bg-contrast/15' : 'bg-surface',
        )}
      >
        <AppText
          className={cn(
            'font-sans-bold text-xs',
            selected ? 'text-contrast' : 'text-primary-deep',
          )}
        >
          {voice.initials}
        </AppText>
      </View>
      <AppText
        numberOfLines={1}
        className={cn(
          'shrink font-sans-bold text-body',
          selected ? 'text-contrast' : 'text-ink',
        )}
      >
        {voice.name}
      </AppText>
    </Pressable>
  );
}

// Step 4: "Change your voice. Keep your style." The same take before and
// after the voice changer, for whichever voice is picked.
export default function OnboardingChangeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  useStatusBarStyle('light-content');
  const [voice, setVoice] = useState(changerVoices[0]);
  const { playingId, playOrStop, stop } = useClipPlayer();

  const onVoice = (next: ChangerVoice) => {
    stop();
    setVoice(next);
  };

  const onNext = () => {
    stop();
    router.push('/clean');
  };

  return (
    <OnboardingStep
      step={4}
      tone="primary"
      titleKey="onboarding.change.title"
      subtitleKey="onboarding.change.subtitle"
      onNext={onNext}
    >
      <OnboardingCard tone="primary">
        <CompareRow
          tone="neutral"
          title={t('onboarding.change.before')}
          caption={t('onboarding.change.beforeCaption')}
          wave={changerBeforeWave}
          playing={playingId === BEFORE_ID}
          onPress={() => playOrStop(BEFORE_ID, changerBeforeUrl)}
        />

        <CardLabel icon="arrowDown" className="mb-2.5 mt-4">
          {t('onboarding.change.turnInto')}
        </CardLabel>

        <View accessibilityRole="radiogroup" className="gap-2">
          {voiceRows.map((row, i) => (
            <View key={i} className="flex-row gap-2">
              {row.map(item => (
                <VoiceOption
                  key={item.id}
                  voice={item}
                  selected={item.id === voice.id}
                  onPress={() => onVoice(item)}
                />
              ))}
            </View>
          ))}
        </View>

        <CompareRow
          tone="highlight"
          title={t('onboarding.change.after')}
          caption={voice.name}
          wave={voice.wave}
          playing={playingId === afterId(voice)}
          onPress={() => playOrStop(afterId(voice), voice.audioUrl)}
          className="mt-4"
        />
      </OnboardingCard>
    </OnboardingStep>
  );
}
