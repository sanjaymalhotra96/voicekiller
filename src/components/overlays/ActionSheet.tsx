import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

export type SheetAction = {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
  // Red styling for irreversible actions (Delete).
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  actions: SheetAction[];
};

// Bottom sheet with a list of actions (Rename / Download / Delete).
export function ActionSheet({ visible, onClose, title, actions }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View className="-mx-4">
        {actions.map(action => {
          const color = action.destructive
            ? palette.danger.DEFAULT
            : palette.ink.muted;
          return (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              className={cn(
                'flex-row items-center gap-3 border-b border-line-neutral px-5 py-4 active:opacity-60',
                action.destructive && 'bg-danger-soft',
              )}
            >
              <Icon name={action.icon} size={iconSize.md} color={color} />
              <AppText
                variant="label"
                className={action.destructive ? 'text-danger' : undefined}
              >
                {action.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
