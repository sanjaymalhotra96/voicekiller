import type { BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

export type TabIcon = { tabIcon: IconName };

// Bottom tab bar: icon + label, orange line over the active tab.
// Each screen sets `tabBarLabel` and `tabIcon` in its options.
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-line-neutral bg-surface"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = String(options.tabBarLabel ?? route.name);
        const icon = (options as typeof options & Partial<TabIcon>).tabIcon;
        const color = focused ? palette.primary.DEFAULT : palette.ink.subtle;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={onPress}
            className="flex-1 items-center pb-2"
          >
            <View
              className={cn(
                'mb-2.5 h-indicator w-full',
                focused ? 'bg-primary' : 'bg-transparent',
              )}
            />
            {icon ? (
              <Icon name={icon} size={iconSize.sm} color={color} />
            ) : null}
            <AppText
              variant="tab"
              className={cn(
                'mt-1',
                focused ? 'text-primary' : 'text-ink-subtle',
              )}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
