import React from 'react';
import { View } from 'react-native';
import { AppText, Icon, IconName } from '@/components';
import { iconSize, useColors } from '@/theme';

type Props = {
  // Glyph inside the shield: `key` for OTP, `help` for forgot password.
  glyph?: Extract<IconName, 'key' | 'help'>;
};

// "* * * *" bubble with a shield, drawn in code.
// Swap for an SVG in src/assets once the artwork is exported.
export function OtpBadge({ glyph = 'key' }: Props) {
  const colors = useColors();
  return (
    <View className="items-center">
      <View className="rounded-full border border-line bg-surface px-6 pb-4 pt-2">
        <AppText variant="badge">****</AppText>
      </View>
      <View className="-mt-5">
        <Icon
          name="shield"
          size={iconSize.xxl}
          color={colors.primary.DEFAULT}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Icon
            name={glyph}
            size={glyph === 'help' ? iconSize.sm : iconSize.xs}
            color={colors.contrast}
          />
        </View>
      </View>
    </View>
  );
}
