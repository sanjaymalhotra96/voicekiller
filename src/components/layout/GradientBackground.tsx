import React from 'react';
import { View, ViewProps } from 'react-native';
import { GradientName, gradientStyle, useColors } from '@/theme';

type Props = ViewProps & {
  variant?: GradientName;
};

// Background only. Screens should use <SafeArea>, which adds safe areas.
export function GradientBackground({
  variant = 'brand',
  className,
  style,
  ...rest
}: Props) {
  const colors = useColors();
  return (
    <View
      className={`flex-1 overflow-hidden bg-canvas ${className ?? ''}`}
      style={[gradientStyle(colors, variant), style]}
      {...rest}
    />
  );
}
