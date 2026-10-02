import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/utils';

type Props = {
  label: string;
  // `ai`: purple pill ("Beta"). `count`: red bubble ("2").
  variant?: 'ai' | 'count';
  className?: string;
};

// Small status marker. Position it with className (e.g. absolute -top-2).
export function Badge({ label, variant = 'ai', className }: Props) {
  return (
    <View
      pointerEvents="none"
      className={cn(
        'items-center justify-center rounded-full',
        variant === 'ai'
          ? 'bg-ai px-1.5 py-px'
          : 'size-count-badge bg-danger',
        className,
      )}
    >
      <AppText variant="micro" className="normal-case">
        {label}
      </AppText>
    </View>
  );
}
