import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { pillLooks, SoundPill } from '@/features/onboarding/SoundPill';
import type { OnboardingSample } from '@/features/onboarding/voicesDemo';
import { gradientStyle, useColors } from '@/theme';

type Props = {
  samples: OnboardingSample[];
  // Row index: picks the direction and offsets the pill looks.
  index: number;
  // Scroll speed in dp per second.
  speed: number;
  activeId: string | null;
  onPress: (id: string) => void;
};

// Endless horizontal loop of sample pills. The pills are drawn twice and
// the strip slides by one copy's width, so the wrap is seamless. The row
// holds still while one of its pills plays, so it stays under the finger.
// With Reduce Motion on, the row becomes a plain horizontal scroller.
export function MarqueeRow({
  samples,
  index,
  speed,
  activeId,
  onPress,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const reverse = index % 2 === 1;
  const paused = samples.some(s => s.id === activeId);

  const copyWidth = useSharedValue(0);
  const offset = useSharedValue(0);
  const isPaused = useSharedValue(paused);

  useEffect(() => {
    isPaused.value = paused;
  }, [paused, isPaused]);

  useFrameCallback(frame => {
    const width = copyWidth.value;
    const dt = frame.timeSincePreviousFrame;
    if (isPaused.value || width === 0 || dt === null) {
      return;
    }
    offset.value = (offset.value + (speed * dt) / 1000) % width;
  }, !reduceMotion);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: reverse ? offset.value - copyWidth.value : -offset.value,
      },
    ],
  }));

  const onCopyLayout = (e: LayoutChangeEvent) => {
    copyWidth.value = e.nativeEvent.layout.width;
  };

  const renderCopy = (copy: number) => (
    <View
      key={copy}
      className="flex-row"
      onLayout={copy === 0 ? onCopyLayout : undefined}
      // The second copy is decoration for the loop.
      importantForAccessibility={copy === 0 ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={copy !== 0}
    >
      {samples.map((sample, i) => {
        const active = sample.id === activeId;
        const label = t(`onboarding.voices.samples.${sample.id}`);
        return (
          <SoundPill
            key={sample.id}
            id={sample.id}
            label={label}
            accessibilityLabel={t(
              active ? 'onboarding.stopSample' : 'onboarding.playSample',
              { name: label },
            )}
            sounding={active}
            look={pillLooks[(i + index) % pillLooks.length]}
            onPress={onPress}
            className="mr-2.5"
          />
        );
      })}
    </View>
  );

  if (reduceMotion) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-6"
      >
        {renderCopy(0)}
      </ScrollView>
    );
  }

  return (
    <View className="overflow-hidden">
      <Animated.View className="flex-row self-start" style={stripStyle}>
        {[0, 1].map(renderCopy)}
      </Animated.View>
      {/* Soft fade at both edges. */}
      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 top-0 w-7"
        style={gradientStyle(colors, 'fadeLeft')}
      />
      <View
        pointerEvents="none"
        className="absolute bottom-0 right-0 top-0 w-7"
        style={gradientStyle(colors, 'fadeRight')}
      />
    </View>
  );
}
