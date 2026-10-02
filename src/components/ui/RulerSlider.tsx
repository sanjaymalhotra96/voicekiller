import React, { useMemo, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { iconSize, palette } from '@/theme';
import { cn } from '@/utils';

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  // Snap/round a raw value (e.g. snapSpeed).
  snap: (value: number) => number;
  format: (value: number) => string;
  // Quick picks under the ruler ("0.5X", "1.0X"...).
  presets?: readonly number[];
  accessibilityLabel: string;
};

// Tick ruler with a draggable orange marker (Speed). Drag or tap anywhere
// on the ruler; presets jump straight to a value. Plain responder events,
// no animation library: one View re-renders while dragging.
export function RulerSlider({
  value,
  min,
  max,
  step,
  onChange,
  snap,
  format,
  presets,
  accessibilityLabel,
}: Props) {
  const [width, setWidth] = useState(0);
  const ticks = useMemo(
    () => Array.from({ length: Math.round((max - min) / step) + 1 }),
    [min, max, step],
  );
  const ratio = (value - min) / (max - min);

  const pick = (event: GestureResponderEvent) => {
    if (width > 0) {
      const x = Math.min(width, Math.max(0, event.nativeEvent.locationX));
      const next = snap(min + (x / width) * (max - min));
      if (next !== value) {
        onChange(next);
      }
    }
  };

  return (
    <View className="gap-2">
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: format(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) =>
          onChange(snap(value + (nativeEvent.actionName === 'increment' ? step : -step)))
        }
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={pick}
        onResponderMove={pick}
        className="pt-8"
      >
        {/* Value label + caret above the marker. */}
        {width > 0 ? (
          <View
            pointerEvents="none"
            className="absolute top-0 w-16 items-center"
            style={{ left: ratio * width - 32 }}
          >
            <AppText variant="label" className="font-sans-bold text-primary">
              {format(value)}
            </AppText>
            <View className="-mt-1.5">
              <Icon name="caretDown" size={iconSize.xxs} color={palette.primary.DEFAULT} />
            </View>
          </View>
        ) : null}
        <View pointerEvents="none" className="h-ruler flex-row items-center justify-between">
          {ticks.map((_, index) => (
            <View key={index} className="h-6 w-px bg-line-neutral" />
          ))}
        </View>
        {width > 0 ? (
          <View
            pointerEvents="none"
            className="absolute bottom-0 h-ruler w-0.5 rounded-full bg-primary"
            style={{ left: ratio * width - 1 }}
          />
        ) : null}
      </View>

      <View className="flex-row justify-between">
        <AppText variant="timestamp">{format(min)}</AppText>
        <AppText variant="timestamp">{format(max)}</AppText>
      </View>

      {presets ? (
        <View className={cn('flex-row justify-between gap-2')}>
          {presets.map(preset => (
            <Chip
              key={preset}
              label={format(preset)}
              selected={preset === value}
              onPress={() => onChange(preset)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
