import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

const tones = {
  // Option sheets: orange tick.
  primary: 'border-primary bg-primary',
  // Picker lists (voices, instructions): dark tick.
  ink: 'border-ink bg-ink',
} as const;

type Props = {
  selected: boolean;
  tone?: keyof typeof tones;
};

// Visual radio mark only. The tappable row around it owns the
// accessibility role and state.
export function Radio({ selected, tone = 'primary' }: Props) {
  return (
    <View
      className={cn(
        'size-radio items-center justify-center rounded-full border',
        selected ? tones[tone] : 'border-ink-subtle bg-transparent',
      )}
    >
      {selected ? (
        <Icon name="check" size={iconSize.xs} color={palette.surface} />
      ) : null}
    </View>
  );
}
