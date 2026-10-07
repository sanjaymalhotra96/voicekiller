import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Phase delays (ms) so neighbouring bars never move together.
const DELAYS = [0, 550, 300, 650];

function Bar({
  height,
  delay,
  color,
  animated,
  width,
}: {
  height: number;
  delay: number;
  color: string;
  animated: boolean;
  width: number;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const barHeight = useSharedValue(height);

  // A new height (e.g. a different waveform) glides instead of jumping.
  useEffect(() => {
    barHeight.value = reduceMotion
      ? height
      : withTiming(height, { duration: 350 });
  }, [barHeight, height, reduceMotion]);

  useEffect(() => {
    if (!animated || reduceMotion) {
      scale.value = 1;
      return;
    }
    scale.value = 0.3;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(scale);
  }, [animated, delay, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    height: barHeight.value,
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      className="rounded-sm"
      style={[{ width, backgroundColor: color }, style]}
    />
  );
}

type Props = {
  // One bar per height, in dp.
  heights: readonly number[];
  color: string;
  gap?: number;
  // False: a still waveform (e.g. a clip that is not playing).
  animated?: boolean;
  barWidth?: number;
  // Per-bar colours, overriding `color` (e.g. to mark a word).
  colors?: readonly string[];
};

// "Now playing" bars that bounce in place (still with Reduce Motion on).
export function EqualizerBars({
  heights,
  color,
  gap = 2,
  animated = true,
  barWidth = 3,
  colors,
}: Props) {
  return (
    <View className="flex-row items-center" style={{ gap }}>
      {heights.map((height, i) => (
        <Bar
          key={i}
          height={height}
          delay={DELAYS[i % DELAYS.length]}
          color={colors?.[i] ?? color}
          animated={animated}
          width={barWidth}
        />
      ))}
    </View>
  );
}
