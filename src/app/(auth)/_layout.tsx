import { Stack } from 'expo-router/stack';
import React from 'react';
import { safeAreaLayout, safeAreaPresets } from '@/components';
import { stackScreenOptions, useColors } from '@/theme';

// Signed-out screens. SafeArea options per route file; index (Welcome)
// uses the defaults.
const screenLayout = safeAreaLayout({
  verify: safeAreaPresets.form,
  'forgot-password': safeAreaPresets.form,
});

export default function AuthLayout() {
  const colors = useColors();
  return (
    <Stack screenOptions={stackScreenOptions(colors)} screenLayout={screenLayout} />
  );
}
