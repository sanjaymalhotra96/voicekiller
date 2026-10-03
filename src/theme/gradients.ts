import { alpha, palette } from '@/theme/palette';

const { ai, glow, primary, surface } = palette;

// A tint that fades from `opacity` at `at` to transparent at `stop`.
const glowAt = (at: string, hex: string, opacity: number, stop: string) =>
  `radial-gradient(circle at ${at}, ${alpha(hex, opacity)} 0%, ${alpha(
    hex,
    0,
  )} ${stop})`;

// Shared CSS background gradients (RN New Architecture `backgroundImage`).
// Add a new key here to give another screen its own variant.
export const gradients = {
  // Warm peach glow at the corners + soft lavender halo behind the logo.
  brand: [
    glowAt('50% 30%', glow.lavender, 0.85, '45%'),
    glowAt('100% 0%', glow.peach, 0.75, '55%'),
    glowAt('0% 100%', glow.blush, 0.6, '50%'),
    `linear-gradient(180deg, ${glow.top} 0%, ${surface} 55%, ${glow.bottom} 100%)`,
  ].join(', '),

  logo: `linear-gradient(135deg, ${primary.dark} 0%, ${primary.light} 100%)`,

  // Action card: white fading into peach on the right.
  actionCard: `linear-gradient(90deg, ${glow.top} 0%, ${glow.top} 40%, ${glow.peach} 100%)`,

  // AI actions and round play buttons: orange into purple.
  ai: `linear-gradient(90deg, ${ai.from} 0%, ${ai.to} 100%)`,
  play: `linear-gradient(135deg, ${ai.from} 0%, ${ai.to} 100%)`,
} as const;

export type GradientName = keyof typeof gradients;

// The only place that knows the style prop name. On RN >= 0.87 switch
// `experimental_backgroundImage` to `backgroundImage`.
export const gradientStyle = (name: GradientName) => ({
  experimental_backgroundImage: gradients[name],
});
