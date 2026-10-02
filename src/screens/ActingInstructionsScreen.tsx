import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ScreenHeader, SegmentedControl } from '@/components';
import { InstructionLibraryTab, MyInstructionsTab } from '@/features/instructions';

type Tab = 'library' | 'mine';

// Pick an acting instruction for the script: the shared library or the
// user's own. Only the visible tab is mounted.
export function ActingInstructionsScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('library');
  const tabs = useMemo(
    () => [
      { key: 'library' as const, label: t('instructions.tabs.library'), icon: 'folderOpen' as const },
      { key: 'mine' as const, label: t('instructions.tabs.mine'), icon: 'fileText' as const },
    ],
    [t],
  );

  return (
    <View className="flex-1 gap-4 pt-2">
      <ScreenHeader title={t('instructions.title')} />
      <SegmentedControl segments={tabs} value={tab} onChange={setTab} />
      {tab === 'library' ? <InstructionLibraryTab /> : <MyInstructionsTab />}
    </View>
  );
}
