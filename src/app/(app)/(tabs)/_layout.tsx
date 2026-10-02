import { Tabs } from 'expo-router/tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconName,
  safeAreaLayout,
  safeAreaPresets,
  TabBar,
  TabIcon,
} from '@/components';

// Tab order, icons and labels. `name` is the route file in this folder;
// labels come from i18n `tabs.<key>`.
const tabs: {
  name: string;
  labelKey: 'tabs.dashboard' | 'tabs.library' | 'tabs.settings';
  icon: IconName;
}[] = [
  { name: 'index', labelKey: 'tabs.dashboard', icon: 'tabHome' },
  { name: 'library', labelKey: 'tabs.library', icon: 'tabLibrary' },
  { name: 'settings', labelKey: 'tabs.settings', icon: 'tabSettings' },
];

const screenLayout = safeAreaLayout({
  index: { ...safeAreaPresets.tab, scroll: true },
  library: safeAreaPresets.tab, // FlatList scrolls itself
  settings: { ...safeAreaPresets.tab, scroll: true },
});

const renderTabBar = (props: Parameters<typeof TabBar>[0]) => (
  <TabBar {...props} />
);

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}
      screenLayout={screenLayout}
    >
      {tabs.map(({ name, labelKey, icon }) => {
        const options: TabIcon & { tabBarLabel: string } = {
          tabBarLabel: t(labelKey),
          tabIcon: icon,
        };
        return <Tabs.Screen key={name} name={name} options={options} />;
      })}
    </Tabs>
  );
}
