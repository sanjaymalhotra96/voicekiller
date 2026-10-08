import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

type ListItemProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
  // Divider under the row (off for the last row in a group).
  divider?: boolean;
};

// Menu row: icon, label, chevron ("Personal Information  >").
function ListItem({
  label,
  icon,
  onPress,
  divider = true,
}: ListItemProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-3 active:opacity-60"
    >
      <Icon name={icon} size={iconSize.md} color={colors.ink.DEFAULT} />
      <View
        className={cn(
          'flex-1 flex-row items-center justify-between py-4',
          divider && 'border-b border-line-subtle',
        )}
      >
        <AppText variant="listItem">{label}</AppText>
        <Icon
          name="chevronRight"
          size={iconSize.sm}
          color={colors.ink.subtle}
        />
      </View>
    </Pressable>
  );
}

type SectionProps = {
  items: (Omit<ListItemProps, 'divider'> & { key: string })[];
};

// A group of ListItems; the last row has no divider.
export function ListGroup({ items }: SectionProps) {
  return (
    <View>
      {items.map(({ key, ...item }, index) => (
        <ListItem key={key} {...item} divider={index < items.length - 1} />
      ))}
    </View>
  );
}
