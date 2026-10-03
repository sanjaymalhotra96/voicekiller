import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Artwork, ArtworkSource } from '@/components/ui/Artwork';
import { Button } from '@/components/ui/Button';
import type { IconName } from '@/components/ui/Icon';
import { gradientStyle, layout } from '@/theme';
import { cn } from '@/utils';

type Props = {
  title: string;
  actionLabel: string;
  actionIcon?: IconName;
  onAction: () => void;
  // Artwork on the right side (SVG from src/assets).
  illustration?: ArtworkSource;
  className?: string;
};

// Highlighted card with a title, one action and optional artwork.
export function ActionCard({
  title,
  actionLabel,
  actionIcon,
  onAction,
  illustration,
  className,
}: Props) {
  return (
    <View
      className={cn(
        'h-action-card flex-row items-center overflow-hidden rounded-2xl border border-line px-5',
        className,
      )}
      style={gradientStyle('actionCard')}
    >
      <View className="flex-1 items-start gap-3">
        <AppText variant="cardTitle" className="text-xl">
          {title}
        </AppText>
        <Button
          size="sm"
          icon={actionIcon}
          label={actionLabel}
          onPress={onAction}
        />
      </View>
      {illustration ? (
        <Artwork source={illustration} {...layout.actionCardArt} />
      ) : null}
    </View>
  );
}
