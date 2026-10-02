import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { layout } from '@/theme';
import { cn } from '@/utils';

type Step<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  steps: readonly Step<K>[];
  value: K;
  onChange: (key: K) => void;
};

// A line with a few stops; the chosen one is a large orange ring
// (Delivery Mode: More Stable / Balanced / More Creative).
export function StepSlider<K extends string>({
  steps,
  value,
  onChange,
}: Props<K>) {
  const last = steps.length - 1;

  return (
    <View accessibilityRole="radiogroup" className="gap-2">
      <View className="h-stop-active justify-center">
        <View className="absolute left-1.5 right-1.5 h-px bg-line-neutral" />
        <View className="flex-row items-center justify-between">
          {steps.map(step => {
            const selected = step.key === value;
            return (
              <Pressable
                key={step.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={step.label}
                hitSlop={layout.hitSlop * 2}
                onPress={() => onChange(step.key)}
                className="size-stop-active items-center justify-center"
              >
                <View
                  className={cn(
                    'rounded-full',
                    selected
                      ? 'size-stop-active border-4 border-primary-soft bg-primary'
                      : 'size-stop-dot bg-line-neutral',
                  )}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="flex-row">
        {steps.map((step, index) => (
          <AppText
            key={step.key}
            variant="timestamp"
            className={cn(
              'flex-1 text-xs',
              index === 0 ? 'text-left' : index === last ? 'text-right' : 'text-center',
              step.key === value ? 'text-primary' : 'text-ink',
            )}
          >
            {step.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}
