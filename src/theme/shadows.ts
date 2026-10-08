import { alpha } from '@/theme/palette';
import type { Palette } from '@/theme/ThemeProvider';

// CSS box shadows (RN New Architecture `boxShadow`), shared across
// screens, from the active palette: shadows(useColors()).fab
export const shadows = ({ ink, primary }: Palette) => ({
  logo: { boxShadow: `0 8px 24px ${alpha(primary.DEFAULT, 0.3)}` },
  // Round "Next" button on onboarding.
  fab: { boxShadow: `0 10px 24px ${alpha(primary.dark, 0.3)}` },
  // White card and button on the orange onboarding screen.
  card: { boxShadow: `0 18px 40px ${alpha(primary.night, 0.22)}` },
  fabLight: { boxShadow: `0 10px 24px ${alpha(primary.night, 0.25)}` },
  // White card on the canvas (onboarding clone step).
  softCard: {
    boxShadow: `0 1px 2px ${alpha(ink.DEFAULT, 0.04)}, 0 14px 36px ${alpha(
      primary.dark,
      0.08,
    )}`,
  },
  // Knob of a toggle switch.
  knob: { boxShadow: `0 2px 6px ${alpha(ink.DEFAULT, 0.25)}` },
  // Onboarding sample pill while it plays.
  pillActive: { boxShadow: `0 8px 20px ${alpha(primary.dark, 0.18)}` },
});

export type ShadowName = keyof ReturnType<typeof shadows>;
