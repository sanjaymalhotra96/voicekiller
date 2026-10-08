import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, toneClasses, toneColor, ToneName, useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  label: string;
  tone: ToneName;
  icon?: IconName;
};

// Small coloured pill ("AI Speech", "Sarah", "0:42").
export function Tag({ label, tone, icon }: Props) {
  const colors = useColors();
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded px-1.5 py-0.5',
        toneClasses[tone].tag,
      )}
    >
      {icon ? (
        <Icon name={icon} size={iconSize.xxs} color={toneColor(colors, tone)} />
      ) : null}
      <AppText
        variant="tag"
        className={toneClasses[tone].tagText}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}
