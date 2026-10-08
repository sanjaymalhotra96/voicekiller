import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { ToneIcon } from '@/components/ui/ToneIcon';
import { iconSize, toneClasses, ToneName, useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  title: string;
  subtitle: string;
  icon: IconName;
  tone: ToneName;
  onPress: () => void;
  // `tile`: grid card, icon above text. `row`: full-width list row.
  layout?: 'tile' | 'row';
  className?: string;
};

// Tinted, tappable card for a tool (Voice Clone, Audio Clean, ...).
export function FeatureCard({
  title,
  subtitle,
  icon,
  tone,
  onPress,
  layout = 'row',
  className,
}: Props) {
  const colors = useColors();
  const isTile = layout === 'tile';
  const arrow = (
    <Icon name="arrowRight" size={iconSize.sm} color={colors.ink.DEFAULT} />
  );
  const text = (
    <View className={isTile ? 'mt-5' : 'flex-1'}>
      <AppText variant="cardTitle">{title}</AppText>
      <AppText variant="caption" className="mt-0.5">
        {subtitle}
      </AppText>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      className={cn(
        'rounded-xl border active:opacity-70',
        toneClasses[tone].card,
        isTile ? 'flex-1 p-4' : 'flex-row items-center gap-3 px-4 py-4',
        className,
      )}
    >
      {isTile ? (
        <>
          <View className="flex-row items-start justify-between">
            <ToneIcon icon={icon} tone={tone} />
            {arrow}
          </View>
          {text}
        </>
      ) : (
        <>
          <ToneIcon icon={icon} tone={tone} />
          {text}
          {arrow}
        </>
      )}
    </Pressable>
  );
}
