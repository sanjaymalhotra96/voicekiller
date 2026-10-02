import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/utils';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

// Small uppercase label with its content below ("CREATE", "TRANSFORM").
export function Section({ title, children, className }: Props) {
  return (
    <View className={cn('gap-3', className)}>
      <AppText variant="overline" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}
