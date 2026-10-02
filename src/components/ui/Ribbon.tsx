import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/utils';

type Props = {
  label: string;
  // Background colour class, e.g. "bg-tone-purple".
  colorClassName: string;
};

// Diagonal corner ribbon ("BASIC PLAN", "STUDIO"). Place inside a card
// with `overflow-hidden`; it pins itself to the top-right corner.
export function Ribbon({ label, colorClassName }: Props) {
  return (
    <View
      pointerEvents="none"
      className="absolute -right-8 top-4 w-32 rotate-45 items-center"
    >
      <View className={cn('w-full items-center py-0.5', colorClassName)}>
        <AppText variant="ribbon">{label}</AppText>
      </View>
    </View>
  );
}
