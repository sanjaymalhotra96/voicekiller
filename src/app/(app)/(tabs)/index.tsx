// Route: / (Dashboard tab)
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { images } from '@/assets';
import { FeatureCard, ActionCard, Section } from '@/components';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { dashboardSections } from '@/features/dashboard/sections';
import { useSignUpPaywall } from '@/features/subscription/hooks';
import { ToolId, tools } from '@/features/tools/tools';

// Screen of each tool (src/app/(app)/<route>.tsx).
const toolRoutes: Record<ToolId, Href> = {
  textToSpeech: '/text-to-speech',
  voiceClone: '/voice-clone',
  voiceDesign: '/voice-design',
  voiceChanger: '/voice-changer',
  audioClean: '/audio-clean',
  speechEditor: '/speech-editor',
  speechToText: '/speech-to-text',
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  // A brand-new account lands here with Unlock Studio on top.
  useSignUpPaywall();

  const openTool = (id: ToolId) => router.push(toolRoutes[id]);

  const card = (id: ToolId, layout: 'tile' | 'row') => (
    <FeatureCard
      key={id}
      layout={layout}
      icon={tools[id].icon}
      tone={tools[id].tone}
      title={t(`tools.${id}.title`)}
      subtitle={t(`tools.${id}.subtitle`)}
      onPress={() => openTool(id)}
    />
  );

  return (
    <View className="gap-6 pb-6 pt-4">
      <DashboardHeader />

      <ActionCard
        title={t('dashboard.actionCard.title')}
        actionLabel={t('dashboard.actionCard.action')}
        actionIcon={tools.textToSpeech.icon}
        illustration={images.dashboardTextToSpeech}
        onAction={() => openTool('textToSpeech')}
      />

      {dashboardSections.map(section => (
        <Section key={section.id} title={t(`dashboard.sections.${section.id}`)}>
          {section.layout === 'grid' ? (
            <View className="flex-row gap-5">
              {section.tools.map(id => card(id, 'tile'))}
            </View>
          ) : (
            <View className="gap-3">
              {section.tools.map(id => card(id, 'row'))}
            </View>
          )}
        </Section>
      ))}
    </View>
  );
}
