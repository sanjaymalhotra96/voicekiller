import React from 'react';
import { glyphs, IconName } from '@/assets';
import { iconSize, palette } from '@/theme';

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
  color = palette.ink.subtle,
}: Props) {
  const Glyph = glyphs[name];
  return <Glyph width={size} height={size} color={color} />;
}
