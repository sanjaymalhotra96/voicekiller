import { alpha, palette } from '@/theme/palette';

// CSS box shadows (RN New Architecture `boxShadow`), shared across screens.
export const shadows = {
  logo: { boxShadow: `0 8px 24px ${alpha(palette.primary.DEFAULT, 0.3)}` },
} as const;
