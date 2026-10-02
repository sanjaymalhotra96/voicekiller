import { Image, ImageSource } from 'expo-image';
import React from 'react';
import type { SvgIcon } from '@/assets';

// An illustration: an SVG component or a bitmap (require('...png')).
export type ArtworkSource = SvgIcon | ImageSource | number;

type Props = {
  source: ArtworkSource;
  width: number;
  height: number;
};

// Renders either kind, so components take one `illustration` prop.
// Bitmaps go through expo-image, which decodes them at the drawn size
// instead of holding the full 3x bitmap in memory.
export function Artwork({ source, width, height }: Props) {
  if (typeof source === 'function') {
    const Svg = source;
    return <Svg width={width} height={height} />;
  }
  return (
    <Image
      source={source}
      contentFit="contain"
      accessibilityIgnoresInvertColors
      style={{ width, height }}
    />
  );
}
