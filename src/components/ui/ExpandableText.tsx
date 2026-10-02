import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { AppText, TextVariant } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  text: string;
  variant?: TextVariant;
  // Lines shown while collapsed.
  lines?: number;
  // Texts shorter than this never need a toggle (cheap, no measuring).
  collapseAfterChars?: number;
  className?: string;
};

// Clamped description with a chevron to show the rest.
export function ExpandableText({
  text,
  variant = 'caption',
  lines = 2,
  collapseAfterChars = 90,
  className,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > collapseAfterChars;

  return (
    <View className={cn('flex-row items-end gap-1', className)}>
      <AppText
        variant={variant}
        numberOfLines={collapsible && !expanded ? lines : undefined}
        className="flex-shrink"
      >
        {text}
      </AppText>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? t('common.showLess') : t('common.showMore')}
          accessibilityState={{ expanded }}
          hitSlop={layout.hitSlop}
          onPress={() => setExpanded(value => !value)}
        >
          <Icon
            name={expanded ? 'chevronUp' : 'chevronDown'}
            size={iconSize.xs}
            color={palette.ink.muted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
