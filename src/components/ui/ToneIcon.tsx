import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, toneClasses, toneColor, ToneName } from '@/theme';
import { cn } from '@/utils';

type Props = {
  icon: IconName;
  tone: ToneName;
};

// Icon on a tinted square, coloured by tone.
export function ToneIcon({ icon, tone }: Props) {
  return (
    <View
      className={cn(
        'size-tile items-center justify-center rounded-lg',
        toneClasses[tone].tile,
      )}
    >
      <Icon name={icon} size={iconSize.md} color={toneColor(tone)} />
    </View>
  );
}
