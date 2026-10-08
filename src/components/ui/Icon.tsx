import React from 'react';
import { glyphs, IconName } from '@/assets';
import { iconSize, useColors } from '@/theme';

export type { IconName } from '@/assets';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

// UI glyph from src/assets/icons (SVG, tinted via currentColor). No icon
// font is loaded, so only the glyphs a screen draws cost memory.
export function Icon({
  name,
  size = iconSize.md,
  color,
}: Props) {
  const colors = useColors();
  const Glyph = glyphs[name];
  // Default: subtle grey of the active scheme.
  return (
    <Glyph width={size} height={size} color={color ?? colors.ink.subtle} />
  );
}
