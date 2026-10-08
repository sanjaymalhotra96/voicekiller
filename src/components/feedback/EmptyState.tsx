import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Artwork, ArtworkSource } from '@/components/ui/Artwork';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, layout, useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  title: string;
  message?: string;
  // Artwork (SVG from src/assets); falls back to `icon`.
  illustration?: ArtworkSource;
  icon?: IconName;
  // Optional button below the text.
  action?: ReactNode;
  // `night` on dark screens.
  tone?: 'light' | 'night';
  className?: string;
};

// Centred placeholder for empty lists, no results and errors.
export function EmptyState({
  title,
  message,
  illustration,
  icon = 'folderOpen',
  action,
  tone = 'light',
  className,
}: Props) {
  const colors = useColors();
  const textClass = tone === 'night' ? 'text-night-text' : 'text-ink';
  return (
    <View
      className={cn('flex-1 items-center justify-center gap-4 px-6', className)}
    >
      {illustration ? (
        <Artwork source={illustration} {...layout.emptyArt} />
      ) : (
        <Icon
          name={icon}
          size={iconSize.xxl}
          color={tone === 'night' ? colors.night.muted : colors.ink.subtle}
        />
      )}
      <View className="items-center gap-1">
        <AppText variant="subtitle" className={cn('text-center', textClass)}>
          {title}
        </AppText>
        {message ? (
          <AppText variant="subtitle" className={cn('text-center', textClass)}>
            {message}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}
