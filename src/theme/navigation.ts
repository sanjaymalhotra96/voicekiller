import { palette } from '@/theme/palette';

// Look shared by every Stack in src/app.
export const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: palette.canvas },
} as const;

// Screen background shown behind transitions, per screen look.
export const screenContentStyles = {
  // Dark editor (Text to Speech).
  night: { backgroundColor: palette.night.DEFAULT },
  // White pages (Acting Instruction modal).
  surface: { backgroundColor: palette.surface },
} as const;
