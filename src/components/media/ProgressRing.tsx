import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { layout, palette } from '@/theme';

type Props = {
  // Outer diameter in dp.
  size: number;
  // 0 to 1.
  ratio: number;
  color?: string;
  trackColor?: string;
  stroke?: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Circular progress drawn clockwise from 12 o'clock.
export function ProgressRing({
  size,
  ratio,
  color = palette.primary.DEFAULT,
  trackColor = palette.primary.soft,
  stroke = layout.ringStroke,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const centre = size / 2;

  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke={trackColor}
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamp(ratio))}
        transform={`rotate(-90 ${centre} ${centre})`}
      />
    </Svg>
  );
}
