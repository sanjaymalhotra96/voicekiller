const { themeColors } = require('./src/theme/palette');
const { fontFamily } = require('./src/theme/fonts');
const { control, borderWidth, radius } = require('./src/theme/sizes');
const {
  fontSize,
  lineHeight,
  letterSpacing,
  aspectRatio,
} = require('./src/theme/typography');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // All tokens come from src/theme: `bg-primary`, `font-sans-bold`,
      // (colours are CSS variables, filled per scheme by ThemeProvider)
      // `h-control`, `text-body`, ...
      colors: themeColors(),
      fontFamily,
      fontSize,
      lineHeight,
      letterSpacing,
      aspectRatio,
      height: control,
      width: control,
      size: control,
      maxWidth: control,
      borderWidth,
      borderRadius: radius,
    },
  },
  plugins: [],
};
