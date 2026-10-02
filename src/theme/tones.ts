import { palette } from '@/theme/palette';

// Class names per accent tone (kept literal so Tailwind can see them).
// card: tinted card, tile: icon square, tag/tagText: small pill.
export const toneClasses = {
  orange: {
    card: 'border-tone-orange-line bg-tone-orange-soft',
    tile: 'bg-tone-orange-tile',
    tag: 'bg-tone-orange-tile',
    tagText: 'text-tone-orange',
  },
  cyan: {
    card: 'border-tone-cyan-line bg-tone-cyan-soft',
    tile: 'bg-tone-cyan-tile',
    tag: 'bg-tone-cyan-tile',
    tagText: 'text-tone-cyan',
  },
  purple: {
    card: 'border-tone-purple-line bg-tone-purple-soft',
    tile: 'bg-tone-purple-tile',
    tag: 'bg-tone-purple-tile',
    tagText: 'text-tone-purple',
  },
  red: {
    card: 'border-tone-red-line bg-tone-red-soft',
    tile: 'bg-tone-red-tile',
    tag: 'bg-tone-red-tile',
    tagText: 'text-tone-red',
  },
  yellow: {
    card: 'border-tone-yellow-line bg-tone-yellow-soft',
    tile: 'bg-tone-yellow-tile',
    tag: 'bg-tone-yellow-tile',
    tagText: 'text-tone-yellow',
  },
  green: {
    card: 'border-tone-green-line bg-tone-green-soft',
    tile: 'bg-tone-green-tile',
    tag: 'bg-tone-green-tile',
    tagText: 'text-tone-green',
  },
  blue: {
    card: 'border-tone-blue-line bg-tone-blue-soft',
    tile: 'bg-tone-blue-tile',
    tag: 'bg-tone-blue-tile',
    tagText: 'text-tone-blue',
  },
  pink: {
    card: 'border-tone-pink-line bg-tone-pink-soft',
    tile: 'bg-tone-pink-tile',
    tag: 'bg-tone-pink-tile',
    tagText: 'text-tone-pink',
  },
} as const;

export type ToneName = keyof typeof toneClasses;

// Icon colour for a tone.
export const toneColor = (tone: ToneName) => palette.tone[tone].DEFAULT;
