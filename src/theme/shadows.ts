import { alpha, palette } from '@/theme/palette';

// CSS box shadows (RN New Architecture `boxShadow`), shared across screens.
export const shadows = {
  logo: { boxShadow: `0 8px 24px ${alpha(palette.primary.DEFAULT, 0.3)}` },
  // Round "Next" button on onboarding.
  fab: { boxShadow: `0 10px 24px ${alpha(palette.primary.dark, 0.3)}` },
  // White card and button on the orange onboarding screen.
  card: { boxShadow: `0 18px 40px ${alpha(palette.primary.night, 0.22)}` },
  fabLight: { boxShadow: `0 10px 24px ${alpha(palette.primary.night, 0.25)}` },
  // White card on the canvas (onboarding clone step).
  softCard: {
    boxShadow: `0 1px 2px ${alpha(
      palette.ink.DEFAULT,
      0.04,
    )}, 0 14px 36px ${alpha(palette.primary.dark, 0.08)}`,
  },
  // Knob of a toggle switch.
  knob: { boxShadow: `0 2px 6px ${alpha(palette.ink.DEFAULT, 0.25)}` },
  // Onboarding sample pill while it plays.
  pillActive: { boxShadow: `0 8px 20px ${alpha(palette.primary.dark, 0.18)}` },
} as const;
