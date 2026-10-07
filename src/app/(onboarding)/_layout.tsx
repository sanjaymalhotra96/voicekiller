import { Stack } from 'expo-router/stack';
import React from 'react';
import { safeAreaLayout } from '@/components';
import { stackScreenOptions } from '@/theme';

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
    <Stack screenOptions={stackScreenOptions} screenLayout={screenLayout} />
  );
}
