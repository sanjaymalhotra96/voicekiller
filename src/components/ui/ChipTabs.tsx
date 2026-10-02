import React from 'react';
import { FlatList } from 'react-native';
import { Chip, ChipItem } from '@/components/ui/Chip';
import { cn } from '@/utils';

export type { ChipItem } from '@/components/ui/Chip';

type Props<K extends string> = {
  items: readonly ChipItem<K>[];
  value: K;
  onChange: (key: K) => void;
  // Classes for the list's content (e.g. horizontal padding).
  contentClassName?: string;
  className?: string;
};

// Horizontally scrollable single-select chips (filters, categories).
export function ChipTabs<K extends string>({
  items,
  value,
  onChange,
  contentClassName,
  className,
}: Props<K>) {
  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={item => item.key}
      extraData={value}
      showsHorizontalScrollIndicator={false}
      className={cn('flex-grow-0', className)}
      contentContainerClassName={cn('gap-2', contentClassName)}
      accessibilityRole="tablist"
      renderItem={({ item }) => (
        <Chip
          role="tab"
          label={item.label}
          selected={item.key === value}
          onPress={() => onChange(item.key)}
        />
      )}
    />
  );
}
