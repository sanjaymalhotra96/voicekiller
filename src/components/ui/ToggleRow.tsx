import React from 'react';
import { Switch, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { palette } from '@/theme';

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  // `night` on dark screens.
  tone?: 'light' | 'night';
};

// Label with an on/off switch ("Denoise & Enhance").
export function ToggleRow({ label, value, onChange, tone = 'light' }: Props) {
  const night = tone === 'night';
  return (
    <View className="flex-row items-center justify-between gap-3">
      <AppText variant="label" className={night ? 'text-night-text' : undefined}>
        {label}
      </AppText>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        thumbColor={palette.surface}
        ios_backgroundColor={night ? palette.night.line : palette.line.neutral}
        trackColor={{
          false: night ? palette.night.line : palette.line.neutral,
          true: palette.primary.DEFAULT,
        }}
      />
    </View>
  );
}
