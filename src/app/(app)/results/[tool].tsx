// Route: /results/:tool (My Clones, My Designs, My Voice Changer...)
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, ScreenHeader } from '@/components';
import { ResultsView } from '@/features/results/ResultsView';
import { isResultTool } from '@/features/results/types';
import { useStatusBarStyle } from '@/hooks';

// "My Clones", "My Designs", "My Voice Changer"...: every result of one
// tool (route /results/<tool>, opened from "View all").
export default function ResultsScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const { tool } = useLocalSearchParams<{ tool: string }>();

  if (!isResultTool(tool)) {
    return (
      <View className="flex-1 pt-2">
        <ScreenHeader tone="night" />
        <EmptyState tone="night" icon="help" title={t('notFound.title')} />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-5">
      <ScreenHeader tone="night" title={t(`results.titles.${tool}`)} />
      <ResultsView tool={tool} mode="all" />
    </View>
  );
}
