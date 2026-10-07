import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { AppText, ExpandableText, IconButton, Radio } from '@/components';
import type { CustomInstruction } from '@/domain';
import { palette } from '@/theme';
import { formatDate } from '@/utils';

type Props = {
  item: CustomInstruction;
  selected: boolean;
  onSelect: (item: CustomInstruction) => void;
  onDelete: (item: CustomInstruction) => void;
};

// One of the user's own instructions.
export const CustomInstructionRow = memo(function CustomInstructionRowInner({
  item,
  selected,
  onSelect,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t('instructions.select', { name: item.name })}
      onPress={() => onSelect(item)}
      className="-mx-4 flex-row items-center gap-3 border-b border-line-neutral px-4 py-4"
    >
      <View className="flex-1 gap-1">
        <AppText variant="cardTitle" numberOfLines={1}>
          {item.name}
        </AppText>
        <ExpandableText text={item.instructions} collapseAfterChars={70} />
        <AppText variant="timestamp" className="text-ink-subtle">
          {t('instructions.mine.created', { date: formatDate(item.createdAt) })}
        </AppText>
      </View>
      <IconButton
        variant="ghost"
        icon="trash"
        color={palette.danger.DEFAULT}
        accessibilityLabel={t('instructions.mine.remove', { name: item.name })}
        onPress={() => onDelete(item)}
      />
      <Radio selected={selected} tone="ink" />
    </Pressable>
  );
});
