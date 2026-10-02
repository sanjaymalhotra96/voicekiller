import React, { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: boolean;
};

export function Checkbox({ checked, onChange, children, error }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={layout.hitSlop}
      onPress={() => onChange(!checked)}
      className="flex-row items-center gap-2.5"
    >
      <View
        className={cn(
          'size-checkbox items-center justify-center rounded border',
          checked
            ? 'border-primary bg-primary'
            : error
            ? 'border-danger bg-field'
            : 'border-line-neutral bg-field',
        )}
      >
        {checked && (
          <Icon name="check" size={iconSize.xs} color={palette.surface} />
        )}
      </View>
      {children}
    </Pressable>
  );
}
