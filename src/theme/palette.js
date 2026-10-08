// Single source of truth for every colour in the app, one palette per
// colour scheme (light / dark, following the phone's setting).
// Plain CommonJS so both tailwind.config.js and the TS theme can import it.
//
// How the two reach the screen:
// - Tailwind classes (bg-surface, text-ink, ...) point at CSS variables
//   (`themeColors` below); ThemeProvider fills them in from the active
//   palette, so classes switch theme by themselves.
// - Colours passed as props (icon colours, SVG fills, gradients) come from
//   useColors() (theme/ThemeProvider), never from these objects directly.
//
// Both palettes must have exactly the same keys.

const lightPalette = {
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
    // Text on the orange onboarding screen and its card labels.
    ink: '#3A1607',
    deep: '#A8350A',
  },
  // Text and icons on a coloured fill (orange buttons, red ribbons, the
  // orange onboarding screen). White in both schemes.
  contrast: '#FFFFFF',
  // Unlock Studio paywall, exactly as designed (its own orange, not
  // `primary`). Used by features/subscription/PaywallScreen.
  paywall: {
    brand: '#f97316', // header, Continue, selected border, check
    tile: '#ffedd5', // feature icon squares
    accent: '#c2410c', // feature icons, "240 minutes/month"
    selected: '#fff7ed', // selected plan background
    card: '#fafafa', // feature list card
    line: '#e5e5e5', // unselected plan border
    text: '#171717', // feature names, prices, SAVE badge
    plan: '#525252', // Yearly / Monthly
    footer: '#737373', // Cancel anytime, Restore, Terms, Privacy
    page: '#ffffff', // screen background
  },
  // Dark surfaces (Text to Speech editor). bg-night, border-night-line...
  // Already dark, so the same in both schemes.
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

// PROVISIONAL dark values, derived from the light palette until the dark
// designs arrive; replace them with the designed colours. Brand colours
// (primary, ai, night, success) stay; backgrounds go dark, text goes light.
const darkPalette = {
  primary: {
    DEFAULT: '#FB6228',
    dark: '#E94A12',
    light: '#FF8452',
    soft: '#3A2116',
    wash: '#2A1912',
    night: '#361E16',
    'night-line': '#765346',
    ink: '#FFD9C7',
    deep: '#FF9A70',
  },
  contrast: '#FFFFFF',
  paywall: {
    brand: '#f97316',
    tile: '#3b2414',
    accent: '#fb923c',
    selected: '#2a1a10',
    card: '#1c1c1e',
    line: '#333335',
    text: '#f5f5f5',
    plan: '#a3a3a3',
    footer: '#8a8a8a',
    page: '#121212',
  },
  night: {
    DEFAULT: '#101112',
    surface: '#161718',
    line: '#28292A',
    text: '#FFFFFF',
    muted: '#A1A1A3',
    subtle: '#5C5D60',
  },
  success: {
    DEFAULT: '#2BC45E',
    night: '#091A10',
    'night-line': '#243F1B',
  },
  ai: {
    DEFAULT: '#8B6CFF',
    from: '#F04E3E',
    to: '#7146EA',
  },
  ink: {
    DEFAULT: '#F2F2F2',
    muted: '#D9D9D9',
    subtle: '#9C9C9E',
    faint: '#7C7C7E',
    inactive: '#6A6A6C',
  },
  surface: '#1C1C1E',
  canvas: '#121212',
  line: {
    DEFAULT: '#4A3026',
    neutral: '#3A3A3C',
    subtle: '#2A2A2C',
  },
  ring: 'rgba(255, 255, 255, 0.9)',
  field: '#2A2A2C',
  muted: '#242426',
  danger: {
    DEFAULT: '#FF4D4D',
    soft: '#3A1818',
    line: '#5C2627',
  },
  link: '#4DB3E6',
  overlay: 'rgba(0, 0, 0, 0.6)',
  glow: {
    peach: '#3A2318',
    blush: '#33201A',
    lavender: '#24223A',
    top: '#161210',
    bottom: '#140F0D',
  },
  tone: {
    orange: {
      DEFAULT: '#FF7A45',
      soft: '#2A1A13',
      line: '#4A2A1C',
      tile: '#3A2116',
    },
    cyan: {
      DEFAULT: '#4CC3D9',
      soft: '#122225',
      line: '#1E3D43',
      tile: '#173238',
    },
    purple: {
      DEFAULT: '#A27BFF',
      soft: '#1E1830',
      line: '#352A52',
      tile: '#2A2142',
    },
    red: {
      DEFAULT: '#FF6B70',
      soft: '#2A1617',
      line: '#4A2527',
      tile: '#3A1D1F',
    },
    yellow: {
      DEFAULT: '#F0C04A',
      soft: '#262113',
      line: '#4A3F1C',
      tile: '#3A3216',
    },
    green: {
      DEFAULT: '#5CCB6C',
      soft: '#132217',
      line: '#21402A',
      tile: '#1A3322',
    },
    blue: {
      DEFAULT: '#6A93F0',
      soft: '#141C2E',
      line: '#23335A',
      tile: '#1C2946',
    },
    pink: {
      DEFAULT: '#E066EE',
      soft: '#26152A',
      line: '#47254F',
      tile: '#38203F',
    },
  },
};

const palettes = { light: lightPalette, dark: darkPalette };

/**
 * `#RRGGBB` + opacity (0-1) -> `rgba(...)`.
 * @param {string} hex
 * @param {number} opacity
 */
function alpha(hex, opacity) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const isHex = value => /^#[0-9A-Fa-f]{6}$/.test(value);

// Every colour as [tailwind name, value]: primary.DEFAULT -> "primary",
// tone.cyan.soft -> "tone-cyan-soft".
function entries(tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) => {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
    return typeof value === 'string' ? [[name, value]] : entries(value, name);
  });
}

// The CSS variables for one palette ({ '--color-primary': '251 98 40' }).
// Hex colours become "r g b" so Tailwind opacity (bg-surface/30) works.
/** @param {typeof lightPalette} tree */
function themeVars(tree) {
  return Object.fromEntries(
    entries(tree).map(([name, value]) => [
      `--color-${name}`,
      isHex(value)
        ? [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16)).join(' ')
        : value,
    ]),
  );
}

// Tailwind `colors`: the same tree, each colour reading its variable.
function themeColors(tree = lightPalette, prefix = '') {
  return Object.fromEntries(
    Object.entries(tree).map(([key, value]) => {
      const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
      if (typeof value !== 'string') {
        return [key, themeColors(value, name)];
      }
      return [
        key,
        isHex(value)
          ? `rgb(var(--color-${name}) / <alpha-value>)`
          : `var(--color-${name})`,
      ];
    }),
  );
}

module.exports = {
  lightPalette,
  darkPalette,
  palettes,
  alpha,
  themeVars,
  themeColors,
};
