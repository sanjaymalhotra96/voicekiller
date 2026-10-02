import { Href, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { illustrations } from '@/assets';
import { FeatureCard, HeroCard, Section } from '@/components';
import { DashboardHeader, dashboardSections } from '@/features/dashboard';
import { ToolId, tools } from '@/features/tools';

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

export function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();

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

      <HeroCard
        title={t('dashboard.hero.title')}
        actionLabel={t('dashboard.hero.action')}
        actionIcon={tools.textToSpeech.icon}
        illustration={illustrations.heroTts}
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
