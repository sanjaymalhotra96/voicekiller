import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { icons, images, SvgIcon } from '@/assets';
import { gradientStyle, palette, shadows } from '@/theme';

// Positions are measured from the 440pt-wide design, relative to the logo
// centre, and scaled to the device width.
const DESIGN_WIDTH = 440;
const HERO_HEIGHT = 520;
const LOGO_SIZE = 100;
const RINGS = [92, 163, 235];

type OrbitItem = {
  Icon: SvgIcon;
  x: number;
  y: number;
  // Matches the SVG's own size; it already includes the bubble and border.
  size: number;
};

const ITEMS: OrbitItem[] = [
  { Icon: images.orbitPumpkin, x: -148, y: -182, size: 72 },
  { Icon: images.orbitSkull, x: 19, y: -164, size: 48 },
  { Icon: images.orbitFlagUS, x: 170, y: -163, size: 40 },
  { Icon: images.orbitMic, x: -159, y: 27, size: 48 },
  { Icon: images.orbitMan, x: 157, y: 28, size: 56 },
  { Icon: images.orbitFlagSE, x: -147, y: 182, size: 48 },
  { Icon: images.orbitShocked, x: 110, y: 207, size: 56 },
];

// Square box of `size` centred on (x, y).
const centred = (x: number, y: number, size: number) => ({
  width: size,
  height: size,
  left: x - size / 2,
  top: y - size / 2,
});

export function OrbitHero() {
  const { width } = useWindowDimensions();
  const scale = width / DESIGN_WIDTH;
  const cx = width / 2;
  const cy = (HERO_HEIGHT * scale) / 2;
  const logoSize = LOGO_SIZE * scale;
  const LogoMark = icons.logoMark;

  return (
    <View style={{ width, height: HERO_HEIGHT * scale }}>
      {RINGS.map(r => (
        <View
          key={r}
          className="absolute rounded-full border-orbit border-ring"
          style={centred(cx, cy, r * 2 * scale)}
        />
      ))}

      {ITEMS.map(({ Icon, x, y, size }, i) => (
        <View
          key={i}
          className="absolute"
          style={centred(cx + x * scale, cy + y * scale, size * scale)}
        >
          <Icon width="100%" height="100%" />
        </View>
      ))}

      <View
        className="absolute rounded-full"
        style={[centred(cx, cy, logoSize), gradientStyle('logo'), shadows.logo]}
      >
        <LogoMark width={logoSize} height={logoSize} color={palette.surface} />
      </View>
    </View>
  );
}
