import { Stack } from 'expo-router/stack';
import React from 'react';
import { safeAreaLayout, safeAreaPresets } from '@/components';
import { screenContentStyles, stackScreenOptions } from '@/theme';

// Acting Instruction pages, presented as one modal over the editor.
const screenLayout = safeAreaLayout({
  index: safeAreaPresets.page,
  '[id]': { ...safeAreaPresets.page, scroll: true },
  new: { ...safeAreaPresets.page, scroll: true },
});

export default function ActingInstructionsLayout() {
  return (
    <Stack
      screenOptions={{
        ...stackScreenOptions,
        contentStyle: screenContentStyles.surface,
      }}
      screenLayout={screenLayout}
    />
  );
}
