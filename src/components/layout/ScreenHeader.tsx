import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils';

type Props = {
  // Shown next to the back button ("Personal Information").
  title?: string;
  // Right side: usage pill, add button...
  trailing?: ReactNode;
  // Next to the title, e.g. a category tag.
  titleAccessory?: ReactNode;
  // `night` for dark screens (Text to Speech editor).
  tone?: 'light' | 'night';
  // Defaults to router.back().
  onBack?: () => void;
  className?: string;
};

// Top row of pushed screens: back button, title and optional trailing.
export function ScreenHeader({
  title,
  trailing,
  titleAccessory,
  tone = 'light',
  onBack,
  className,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const isNight = tone === 'night';

  return (
    <View className={cn('mt-2 flex-row items-center gap-4', className)}>
      <IconButton
        icon="chevronLeft"
        variant={isNight ? 'night' : 'outlined'}
        accessibilityLabel={t('common.back')}
        onPress={onBack ?? router.back}
      />
      {title ? (
        <View className="flex-1 flex-row items-center gap-2">
          <AppText
            variant="title"
            accessibilityRole="header"
            numberOfLines={1}
            className={cn('flex-shrink', isNight && 'text-night-text')}
          >
            {title}
          </AppText>
          {titleAccessory}
        </View>
      ) : (
        <View className="flex-1" />
      )}
      {trailing}
    </View>
  );
}
