import React from 'react';
import { Switch, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useColors } from '@/theme';

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  // `night` on dark screens.
  tone?: 'light' | 'night';
};

// Label with an on/off switch ("Denoise & Enhance").
export function ToggleRow({ label, value, onChange, tone = 'light' }: Props) {
  const colors = useColors();
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
        thumbColor={colors.contrast}
        ios_backgroundColor={night ? colors.night.line : colors.line.neutral}
        trackColor={{
          false: night ? colors.night.line : colors.line.neutral,
          true: colors.primary.DEFAULT,
        }}
      />
    </View>
  );
}
