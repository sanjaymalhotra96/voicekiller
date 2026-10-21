import React from 'react';
import { safeAreaLayout } from '@/components';
import { OnboardingPager } from '@/features/onboarding/OnboardingPager';

// First-launch intro, shown before the Welcome screen. Each step sets its
// own flat background; the editable steps scroll above the keyboard.
const screenLayout = safeAreaLayout({
  index: { background: 'none' },
  direct: { background: 'primary', scroll: true },
  clone: { background: 'none', scroll: true },
  change: { background: 'primary' },
  clean: { background: 'none' },
  edit: { background: 'primary' },
});

export default function OnboardingLayout() {
  return (
    <OnboardingPager
      initialRouteName="index"
      backBehavior="order"
      screenLayout={screenLayout}
    >
      <OnboardingPager.Screen name="index" />
      <OnboardingPager.Screen name="direct" />
      <OnboardingPager.Screen name="clone" />
      <OnboardingPager.Screen name="change" />
      <OnboardingPager.Screen name="clean" />
      <OnboardingPager.Screen name="edit" />
    </OnboardingPager>
  );
}
