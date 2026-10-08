import type { Palette } from '@/theme/ThemeProvider';

// Look shared by every Stack in src/app, from the active palette:
// stackScreenOptions(useColors()).
export const stackScreenOptions = (colors: Palette) =>
  ({
    headerShown: false,
    animation: 'slide_from_right',
    contentStyle: { backgroundColor: colors.canvas },
  }) as const;

// Screen background shown behind transitions, per screen look.
export const screenContentStyles = (colors: Palette) =>
  ({
    // Dark editor (Text to Speech).
    night: { backgroundColor: colors.night.DEFAULT },
    // White pages (Acting Instruction modal).
    surface: { backgroundColor: colors.surface },
  }) as const;
