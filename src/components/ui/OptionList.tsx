import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Radio } from '@/components/ui/Radio';
import { cn } from '@/utils';

export type Option<K extends string> = { key: K; label: string };

type RowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  // `radio`: single choice with a radio mark. `action`: plain tappable row.
  mode: 'radio' | 'action';
  divider: boolean;
};

const OptionRow = memo(function OptionRowInner({
  label,
  selected,
  onPress,
  mode,
  divider,
}: RowProps) {
  const isRadio = mode === 'radio';
  return (
    <Pressable
      accessibilityRole={isRadio ? 'radio' : 'button'}
      accessibilityState={isRadio ? { selected } : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between px-5 py-4 active:bg-muted',
        divider && 'border-b border-line-neutral',
      )}
    >
      <AppText variant="listItem" className="flex-1">
        {label}
      </AppText>
      {isRadio ? <Radio selected={selected} /> : null}
    </Pressable>
  );
});

type Props<K extends string> = {
  options: readonly Option<K>[];
  // Selected key (null = none yet). Omit for an action list
  // (e.g. "Add pause": tap to insert).
  value?: K | null;
  onSelect: (key: K) => void;
  className?: string;
};

// Full-bleed list of options for bottom sheets: emotions, accents,
// languages, campaigns, pause lengths. Sheets pad their content with px-4,
// so the list cancels it to run edge to edge.
export function OptionList<K extends string>({
  options,
  value,
  onSelect,
  className,
}: Props<K>) {
  const mode = value === undefined ? 'action' : 'radio';
  return (
    <View
      accessibilityRole={mode === 'radio' ? 'radiogroup' : undefined}
      className={cn('-mx-4', className)}
    >
      {options.map((option, index) => (
        <OptionRow
          key={option.key}
          label={option.label}
          selected={option.key === value}
          onPress={() => onSelect(option.key)}
          mode={mode}
          divider={index < options.length - 1}
        />
      ))}
    </View>
  );
}
