import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/utils';

export type ChipItem<K extends string> = { key: K; label: string };

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  // `radio` for single choice, `checkbox` for toggles.
  role?: 'tab' | 'radio' | 'checkbox';
};

// Rounded filter pill: dark when selected, outlined otherwise.
export const Chip = memo(function ChipInner({
  label,
  selected,
  onPress,
  role = 'radio',
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={
        role === 'checkbox' ? { checked: selected } : { selected }
      }
      onPress={onPress}
      className={cn(
        'h-chip items-center justify-center rounded-full border px-4 active:opacity-70',
        selected ? 'border-ink bg-ink' : 'border-line-neutral bg-surface',
      )}
    >
      <AppText
        variant="chip"
        className={selected ? 'text-surface' : 'text-ink-muted'}
      >
        {label}
      </AppText>
    </Pressable>
  );
});

type GroupProps<K extends string> = {
  items: readonly ChipItem<K>[];
  // null = nothing selected.
  value: K | null;
  onChange: (key: K) => void;
  // Tapping the selected chip again clears it (optional filters).
  allowDeselect?: boolean;
  onClear?: () => void;
  className?: string;
};

// Wrapping group of chips with one selection (Provider, Gender).
export function ChipGroup<K extends string>({
  items,
  value,
  onChange,
  allowDeselect = false,
  onClear,
  className,
}: GroupProps<K>) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={cn('flex-row flex-wrap gap-2', className)}
    >
      {items.map(item => {
        const selected = item.key === value;
        return (
          <Chip
            key={item.key}
            label={item.label}
            selected={selected}
            role={allowDeselect ? 'checkbox' : 'radio'}
            onPress={() =>
              selected && allowDeselect ? onClear?.() : onChange(item.key)
            }
          />
        );
      })}
    </View>
  );
}
