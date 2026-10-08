// Route: /edit (onboarding step 6)
import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { AppText, Icon } from '@/components';
import { CompareRow } from '@/features/onboarding/CompareRow';
import {
  editorFixedColors,
  editorFixedUrl,
  editorOriginalColors,
  editorOriginalUrl,
  editorParts,
  editorRightWord,
  editorWave,
  editorWrongWord,
} from '@/features/onboarding/editDemo';
import { OnboardingCard } from '@/features/onboarding/OnboardingCard';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { completeOnboarding } from '@/features/onboarding/store';
import { useClipPlayer } from '@/features/onboarding/useClipPlayer';
import { useStatusBarStyle } from '@/hooks';
import { iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

const ORIGINAL_ID = 'original';
const FIXED_ID = 'fixed';

// Step 6: "Fix mistakes by editing text." Tap the wrong word in the
// transcript to fix it, then hear the original and the edited take.
export default function OnboardingEditScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  useStatusBarStyle('light-content');
  const [fixed, setFixed] = useState(false);
  const { playingId, playOrStop, stop } = useClipPlayer();

  const onWord = () => {
    stop();
    setFixed(value => !value);
  };

  // TODO: push step 7 once it exists; until then this ends onboarding.
  const onNext = () => {
    stop();
    completeOnboarding();
  };

  // Nested Text keeps the words flowing as one paragraph.
  const word = fixed ? (
    <Text
      accessibilityRole="button"
      accessibilityLabel={t('onboarding.edit.wordFixed', {
        word: editorRightWord,
        from: editorWrongWord,
      })}
      onPress={onWord}
    >
      <Text className="font-sans-medium text-ink-subtle line-through">
        {editorWrongWord}
      </Text>{' '}
      <Text className="bg-ink font-sans-bold text-surface">
        {` ${editorRightWord} `}
      </Text>
    </Text>
  ) : (
    <Text
      accessibilityRole="button"
      accessibilityLabel={t('onboarding.edit.wordWrong', {
        word: editorWrongWord,
      })}
      onPress={onWord}
      className="bg-primary-soft font-sans-bold text-primary-deep underline"
      style={{ textDecorationColor: colors.primary.dark }}
    >
      {` ${editorWrongWord} `}
    </Text>
  );

  return (
    <OnboardingStep
      step={6}
      tone="primary"
      titleKey="onboarding.edit.title"
      subtitleKey="onboarding.edit.subtitle"
      onNext={onNext}
    >
      <OnboardingCard tone="primary">
        <CompareRow
          tone="neutral"
          title={t('onboarding.edit.original')}
          wave={editorWave}
          waveColors={editorOriginalColors(colors)}
          playing={playingId === ORIGINAL_ID}
          onPress={() => playOrStop(ORIGINAL_ID, editorOriginalUrl)}
        />

        <View className="mt-3.5 rounded-panel border-emphasis border-dashed border-line bg-primary-wash px-4 pb-3.5 pt-4">
          <Text className="font-sans-semibold text-xl leading-8 text-ink">
            “
            {editorParts.map((part, i) => (
              <Fragment key={i}>{part ?? word}</Fragment>
            ))}
            ”
          </Text>
          <View className="mt-2.5 flex-row items-center gap-1.5">
            <Icon
              name={fixed ? 'check' : 'tap'}
              size={iconSize.sm}
              color={fixed ? colors.ink.DEFAULT : colors.primary.deep}
            />
            <AppText
              className={cn(
                'font-sans-semibold text-sm',
                fixed ? 'text-ink' : 'text-primary-deep',
              )}
            >
              {t(
                fixed
                  ? 'onboarding.edit.hintFixed'
                  : 'onboarding.edit.hintWrong',
              )}
            </AppText>
          </View>
        </View>

        <CompareRow
          tone="highlight"
          title={t('onboarding.edit.fixed')}
          wave={editorWave}
          waveColors={editorFixedColors(colors)}
          playing={playingId === FIXED_ID}
          disabled={!fixed}
          onPress={() => playOrStop(FIXED_ID, editorFixedUrl)}
          className="mt-3.5"
        />
      </OnboardingCard>
    </OnboardingStep>
  );
}
