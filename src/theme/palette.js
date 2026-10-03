// Single source of truth for every colour in the app (`palette`).
// Plain CommonJS so both tailwind.config.js and the TS theme can import it.
// Change `primary` here and it updates Tailwind classes, gradients and shadows.

const palette = {
  primary: {
    DEFAULT: '#FB6228',
    dark: '#E94A12',
    light: '#FF8452',
    // Selected option card (MP3) and highlighted row backgrounds.
    soft: '#FFEEE8',
    wash: '#FFF4F0',
    // Voice chip on the dark editor.
    night: '#361E16',
    'night-line': '#765346',
  },
  // Dark surfaces (Text to Speech editor). bg-night, border-night-line...
  night: {
    DEFAULT: '#101112',
    surface: '#161718',
    line: '#28292A',
    text: '#FFFFFF',
    muted: '#A1A1A3',
    subtle: '#5C5D60',
  },
  // Remaining-minutes pill on dark.
  success: {
    DEFAULT: '#2BC45E',
    night: '#091A10',
    'night-line': '#243F1B',
  },
  // AI features: "Beta" badge and the orange-to-purple gradient.
  ai: {
    DEFAULT: '#6946F4',
    from: '#F04E3E',
    to: '#7146EA',
  },
  ink: {
    DEFAULT: '#333333',
    muted: '#3D3D3D',
    subtle: '#7A7A7A',
    // Section headings ("GENERAL").
    faint: '#989898',
    // Inactive tab icon and label.
    inactive: '#AAAAAA',
  },
  surface: '#FFFFFF',
  canvas: '#FFF9F6',
  line: {
    DEFAULT: '#FFD9CB',
    neutral: '#E6E6E6',
    // Dividers between list rows and inside cards.
    subtle: '#F2F0EE',
  },
  ring: 'rgba(255, 255, 255, 0.9)',

  // Form fields.
  field: '#F3F3F3',
  // Read-only cards and segmented control tracks.
  muted: '#F5F5F5',
  danger: {
    DEFAULT: '#FF1B1B',
    soft: '#FFE3E3',
    line: '#F9C9CA',
  },
  link: '#1E9BD7',
  overlay: 'rgba(0, 0, 0, 0.45)',

  // Background glow tints used by the gradients.
  glow: {
    peach: '#FFD2BE',
    blush: '#FFDED0',
    lavender: '#DEDCF6',
    top: '#FFF8F5',
    bottom: '#FFF6F2',
  },

  // Accent tones for tool cards. Each has: DEFAULT (icon), soft (card
  // background), line (card border), tile (icon background).
  // Tailwind: bg-tone-cyan-soft, border-tone-cyan-line, bg-tone-cyan-tile.
  tone: {
    orange: {
      DEFAULT: '#F2541B',
      soft: '#FFF4EF',
      line: '#FCD5C5',
      tile: '#FFE3D8',
    },
    cyan: {
      DEFAULT: '#2A9DB3',
      soft: '#F3FBFD',
      line: '#C4ECF3',
      tile: '#D3F0F6',
    },
    purple: {
      DEFAULT: '#8456E8',
      soft: '#F9F5FF',
      line: '#E4D7FA',
      tile: '#E8DDFB',
    },
    red: {
      DEFAULT: '#E0474C',
      soft: '#FFF5F5',
      line: '#F8CDCF',
      tile: '#FADCDD',
    },
    yellow: {
      DEFAULT: '#D4A11E',
      soft: '#FFFDF3',
      line: '#F5E8B8',
      tile: '#F6ECC6',
    },
    green: {
      DEFAULT: '#3BA84B',
      soft: '#F4FDF5',
      line: '#C8EDCD',
      tile: '#D7F2DB',
    },
    blue: {
      DEFAULT: '#3A6BDB',
      soft: '#F3F6FF',
      line: '#CCD9F8',
      tile: '#DAE4FB',
    },
    pink: {
      DEFAULT: '#C935D8',
      soft: '#FDF5FF',
      line: '#F2CFF8',
      tile: '#F9E4FF',
    },
  },
};

/**
 * `#RRGGBB` + opacity (0-1) -> `rgba(...)`.
 * @param {string} hex
 * @param {number} opacity
 */
function alpha(hex, opacity) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

module.exports = { palette, alpha };
