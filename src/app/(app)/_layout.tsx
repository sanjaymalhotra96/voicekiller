import { Stack } from 'expo-router/stack';
import React from 'react';
import { safeAreaLayout, safeAreaPresets } from '@/components';
import { useUpgradeOnPlanLimit } from '@/features/subscription/hooks';
import { screenContentStyles, stackScreenOptions, useColors } from '@/theme';

// Dark tool screens (route file names). Their forms scroll; the editor
// and the results grid scroll themselves.
const darkForms = [
  'voice-clone',
  'voice-design',
  'voice-changer',
  'audio-clean',
  'speech-editor',
  'speech-to-text',
] as const;
const darkScreens = ['text-to-speech', 'results/[tool]', ...darkForms];

// Signed-in screens: the tabs plus pushed screens.
const screenLayout = safeAreaLayout({
  '(tabs)': null, // the tabs wrap their own screens
  'acting-instructions': null, // nested stack wraps its own screens
  paywall: null, // edge-to-edge orange header; pads itself
  'personal-info': safeAreaPresets.form,
  'change-password': safeAreaPresets.form,
  // Full-width chat: the screen pads only its header.
  support: {},
  'text-to-speech': safeAreaPresets.night,
  'results/[tool]': safeAreaPresets.night,
  ...Object.fromEntries(
    darkForms.map(name => [name, { ...safeAreaPresets.night, scroll: true }]),
  ),
});

// The stack always starts on the tabs. Without this, the first
// <Stack.Screen> declared below would become the start screen (it once
// opened Text to Speech after sign-in, with nothing to go back to).
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function AppLayout() {
  const colors = useColors();
  // Out of minutes or a paid-only feature: show the plans (/paywall).
  useUpgradeOnPlanLimit();
  return (
    <Stack
      screenOptions={stackScreenOptions(colors)}
      screenLayout={screenLayout}
    >
      {/* Declared first: the start screen. */}
      <Stack.Screen name="(tabs)" />
      {darkScreens.map(name => (
        <Stack.Screen
          key={name}
          name={name}
          // Dark behind the slide transition, no white flash.
          options={{ contentStyle: screenContentStyles(colors).night }}
        />
      ))}
      <Stack.Screen
        name="acting-instructions"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}
