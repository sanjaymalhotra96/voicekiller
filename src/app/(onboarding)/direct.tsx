// Route: /direct (onboarding step 2)
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText, ChipGroup, FormError, TextArea } from '@/components';
import { textLimits } from '@/domain';
import {
  DirectingTagId,
  directingTagIds,
} from '@/features/onboarding/directDemo';
import {
  CardLabel,
  OnboardingCard,
} from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { TakeButton } from '@/features/onboarding/TakeButton';
import { useGeneratedTake } from '@/features/onboarding/useGeneratedTake';
import { useStatusBarStyle } from '@/hooks';
import { generateOnboardingActing } from '@/services/onboarding';

// Step 2: "Now you direct the voice." Pick a feeling (or write one), hit
// Generate, and hear the demo line acted that way.
export default function OnboardingDirectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  useStatusBarStyle('light-content');
  const tags = useMemo(
    () =>
      directingTagIds.map(id => ({
        key: id,
        label: t(`onboarding.direct.tags.${id}.label`),
        text: t(`onboarding.direct.tags.${id}.text`),
      })),
    [t],
  );
  const [instructions, setInstructions] = useState(tags[0].text);
  const { phase, error, play, reset } = useGeneratedTake();
  // A tag stays selected while the box still holds its exact text.
  const selected = tags.find(tag => tag.text === instructions)?.key ?? null;

  const onTag = (id: DirectingTagId) => {
    reset();
    setInstructions(tags.find(tag => tag.key === id)?.text ?? '');
  };

  const onEdit = (text: string) => {
    if (phase !== 'idle') {
      reset();
    }
    setInstructions(text);
  };

  const onTake = () => {
    if (phase === 'playing') {
      reset();
    } else {
      const text = instructions.trim();
      play(text, signal => generateOnboardingActing(text, signal));
    }
  };

  const onNext = () => {
    reset();
    router.push('/clone');
  };

  return (
    <OnboardingStep
      step={2}
      tone="primary"
      titleKey="onboarding.direct.title"
      subtitleKey="onboarding.direct.subtitle"
      onNext={onNext}
    >
      <OnboardingCard tone="primary">
        <CardLabel icon="edit">{t('onboarding.direct.actingLabel')}</CardLabel>
        <TextArea
          tone="warm"
          accessibilityLabel={t('onboarding.direct.actingLabel')}
          value={instructions}
          onChangeText={onEdit}
          maxLength={textLimits.onboardingInstructions}
          placeholder={t('onboarding.direct.actingPlaceholder')}
          boxClassName="h-24"
          className="mt-2"
        />

        <ChipGroup
          items={tags}
          value={selected}
          onChange={onTag}
          className="mt-3"
        />

        <CardLabel tone="muted" className="mt-4">
          {t('onboarding.direct.scriptLabel')}
        </CardLabel>
        {/* The server reads this fixed line; only the acting changes. */}
        <View className="mt-2 rounded-xl bg-field px-4 py-3">
          <AppText className="font-sans-medium text-lg leading-7 text-ink">
            {t('onboarding.direct.script')}
          </AppText>
        </View>

        <TakeButton
          phase={phase}
          labels={{
            idle: t('onboarding.direct.generate'),
            loading: t('onboarding.direct.generating'),
            playing: t('onboarding.direct.playing'),
          }}
          idleIcon="sparkles"
          disabled={!instructions.trim()}
          onPress={onTake}
        />
        <FormError error={error} className="mt-3" />
      </OnboardingCard>
    </OnboardingStep>
  );
}
