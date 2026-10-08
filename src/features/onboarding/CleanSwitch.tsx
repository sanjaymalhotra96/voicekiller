import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText, Icon, IconName } from '@/components';
import { iconSize, shadows, useColors } from '@/theme';
import { cn } from '@/utils';

// Knob travel inside the 68 x 40 track (4 dp padding, 32 dp knob).
const TRAVEL = 28;

function Side({
  label,
  icon,
  active,
  activeClass,
  activeColor,
  onPress,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  activeClass: string;
  activeColor: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="h-11 flex-row items-center gap-1.5 px-2 active:opacity-70"
    >
      <Icon
        name={icon}
        size={iconSize.md}
        color={active ? activeColor : colors.ink.subtle}
      />
      <AppText
        className={cn(
          'font-sans-bold text-base',
          active ? activeClass : 'text-ink-subtle',
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

type Props = {
  clean: boolean;
  onChange: (clean: boolean) => void;
};

// Noisy [switch] Clean. Both labels are tappable too.
export function CleanSwitch({ clean, onChange }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(clean ? TRAVEL : 0);

  useEffect(() => {
    const to = clean ? TRAVEL : 0;
    offset.value = reduceMotion ? to : withTiming(to, { duration: 250 });
  }, [clean, offset, reduceMotion]);

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View className="mt-4 flex-row items-center justify-center gap-2.5">
      <Side
        label={t('onboarding.clean.noisy')}
        icon="volumeOff"
        active={!clean}
        activeClass="text-ink"
        activeColor={colors.ink.DEFAULT}
        onPress={() => onChange(false)}
      />
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={t('onboarding.clean.switch')}
        accessibilityState={{ checked: clean }}
        onPress={() => onChange(!clean)}
        className={cn(
          'h-10 w-switch-track justify-center rounded-full p-1',
          clean ? 'bg-primary' : 'bg-ink-inactive',
        )}
      >
        <Animated.View
          style={[shadows(colors).knob, knob]}
          className="size-8 rounded-full bg-surface"
        />
      </Pressable>
      <Side
        label={t('onboarding.clean.clean')}
        icon="sparkles"
        active={clean}
        activeClass="text-primary-deep"
        activeColor={colors.primary.deep}
        onPress={() => onChange(true)}
      />
    </View>
  );
}
