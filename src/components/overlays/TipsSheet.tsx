import React from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  tips: readonly string[];
};

// Checklist of tips (the "Guide" pill on Voice Clone and Voice Design).
export function TipsSheet({ visible, onClose, title, tips }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-4">
        {tips.map(tip => (
          <View key={tip} className="flex-row gap-3">
            <Icon
              name="checkCircle"
              size={iconSize.md}
              color={palette.success.DEFAULT}
            />
            <AppText variant="body" className="flex-1 text-ink">
              {tip}
            </AppText>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}
