// Route: /change (onboarding step 4)
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
import { cloneVoices } from '@/features/onboarding/cloneDemo';
import { CompareRow } from '@/features/onboarding/CompareRow';
import {
  CardLabel,
  OnboardingCard,
} from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { SamplePlaybackIcon } from '@/features/onboarding/SamplePlaybackIcon';
import { useOnboardingPlayer } from '@/features/onboarding/useOnboardingPlayer';
import { useStatusBarStyle } from '@/hooks';
import { useColors } from '@/theme';
import { cn } from '@/utils';

const BEFORE_ID = 'before';
const afterId = (voice: ChangerVoice) => `after:${voice.id}`;
const sampleId = (voice: ChangerVoice) => `sample:${voice.id}`;

// The voice grid, two per row.
const voiceRows = [changerVoices.slice(0, 2), changerVoices.slice(2, 4)];

function VoiceOption({
  voice,
  selected,
  playing,
  loading,
  previewLabel,
  onPreview,
  onPress,
}: {
  voice: ChangerVoice;
  selected: boolean;
  playing: boolean;
  loading: boolean;
  previewLabel: string;
  onPreview: () => void;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <View
      className={cn(
        'h-option flex-1 flex-row items-center rounded-2xl pl-1',
        selected ? 'bg-ink' : 'bg-field',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={previewLabel}
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        onPress={onPreview}
        className="size-11 items-center justify-center rounded-full active:opacity-70"
      >
        <View
          className={cn(
            'size-8 items-center justify-center rounded-full',
            selected ? 'bg-contrast/15' : 'bg-surface',
          )}
        >
          <SamplePlaybackIcon
            playing={playing}
            loading={loading}
            color={selected ? colors.contrast : colors.primary.deep}
          />
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={voice.name}
        accessibilityState={{ selected }}
        onPress={onPress}
        className="h-full flex-1 justify-center rounded-r-2xl pl-1 pr-3 active:opacity-80"
      >
        <AppText
          numberOfLines={1}
          className={cn(
            'font-sans-bold text-body',
            selected ? 'text-contrast' : 'text-ink',
          )}
        >
          {voice.name}
        </AppText>
      </Pressable>
    </View>
  );
}

// Step 4: "Change your voice. Keep your style." The same take before and
// after the voice changer, for whichever voice is picked.
export default function OnboardingChangeScreen() {
  const { t } = useTranslation();
  useStatusBarStyle('light-content');
  const [voice, setVoice] = useState(changerVoices[0]);
  const { playingId, loadingId, playOrStop, stop } = useOnboardingPlayer();

  const onVoice = (next: ChangerVoice) => {
    stop();
    setVoice(next);
  };

  const onPreview = (next: ChangerVoice) => {
    const cloneId = next.id === 'elon' ? 'musk' : next.id;
    const sample = cloneVoices.find(item => item.id === cloneId);
    if (!sample) return;
    playOrStop({ id: sampleId(next), audioUrl: sample.sample });
  };

  const onNext = (go: (name: string) => void) => {
    stop();
    go('clean');
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
          loading={loadingId === BEFORE_ID}
          onPress={() =>
            playOrStop({ id: BEFORE_ID, audioUrl: changerBeforeUrl })
          }
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
                  playing={playingId === sampleId(item)}
                  loading={loadingId === sampleId(item)}
                  previewLabel={t(
                    playingId === sampleId(item)
                      ? 'onboarding.clone.stopReal'
                      : 'onboarding.clone.playReal',
                    { name: item.name },
                  )}
                  onPreview={() => onPreview(item)}
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
          loading={loadingId === afterId(voice)}
          onPress={() =>
            playOrStop({ id: afterId(voice), audioUrl: voice.audioUrl })
          }
          className="mt-4"
        />
      </OnboardingCard>
    </OnboardingStep>
  );
}
