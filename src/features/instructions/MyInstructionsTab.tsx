import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  View,
} from 'react-native';
import { images } from '@/assets';
import {
  AppText,
  Button,
  EmptyState,
  FormError,
  IconButton,
} from '@/components';
import type { CustomInstruction } from '@/domain';
import { CustomInstructionRow } from '@/features/instructions/CustomInstructionRow';
import {
  useCustomInstructions,
  useDeleteInstruction,
} from '@/features/instructions/hooks';
import { useInstructionSelection } from '@/features/instructions/useInstructionSelection';
import { errorMessageKey } from '@/lib/errors';
import { palette } from '@/theme';
import { confirmDestructive } from '@/utils';

const NEW_ROUTE = '/acting-instructions/new';

// "My Instructions" tab: the user's own list, or an empty state.
export function MyInstructionsTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const custom = useCustomInstructions();
  const remove = useDeleteInstruction();
  const { customId, selectCustom } = useInstructionSelection();
  const openNew = useCallback(() => router.push(NEW_ROUTE), [router]);
  const removeItem = remove.mutate;

  const confirmDelete = useCallback(
    (item: CustomInstruction) =>
      confirmDestructive({
        title: t('instructions.mine.removeTitle'),
        message: t('instructions.mine.removeMessage', { name: item.name }),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        onConfirm: () => removeItem(item.id),
      }),
    [t, removeItem],
  );

  const renderItem = useCallback<ListRenderItem<CustomInstruction>>(
    ({ item }) => (
      <CustomInstructionRow
        item={item}
        selected={item.id === customId}
        onSelect={selectCustom}
        onDelete={confirmDelete}
      />
    ),
    [customId, selectCustom, confirmDelete],
  );

  if (custom.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={palette.primary.DEFAULT} />
      </View>
    );
  }
  if (custom.isError) {
    return (
      <EmptyState
        icon="cloudOff"
        title={t(errorMessageKey(custom.error))}
        action={
          <Button
            size="sm"
            icon="refresh"
            label={t('library.retry')}
            onPress={() => custom.refetch()}
          />
        }
      />
    );
  }
  if (custom.data.length === 0) {
    return (
      <EmptyState
        illustration={images.instructionsEmpty}
        title={t('instructions.mine.emptyTitle')}
        message={t('instructions.mine.emptyMessage')}
        action={
          <Button
            variant="ai"
            icon="sparkles"
            label={t('instructions.mine.generate')}
            onPress={openNew}
            className="mt-2 self-center px-6"
          />
        }
      />
    );
  }

  return (
    <View className="flex-1 gap-2">
      <View className="flex-row items-center justify-between">
        <AppText variant="title" className="text-xl" accessibilityRole="header">
          {t('instructions.mine.title')}
        </AppText>
        <IconButton
          shape="circle"
          variant="solid"
          icon="add"
          accessibilityLabel={t('instructions.mine.add')}
          onPress={openNew}
          className="size-icon-btn"
        />
      </View>
      <FormError error={remove.error} />
      <FlatList
        data={custom.data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </View>
  );
}
