import { alpha } from '@/theme/palette';
import type { Palette } from '@/theme/ThemeProvider';

// CSS box shadows (RN New Architecture `boxShadow`), shared across
// screens, from the active palette: shadows(useColors()).fab
export const shadows = ({ ink, night, paywall, primary }: Palette) => ({
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
  // 3-day trial paywall: review cards, plan cards, Try button.
  review: { boxShadow: `0 8px 22px ${alpha(night.DEFAULT, 0.08)}` },
  trialPlan: { boxShadow: `0 2px 10px ${alpha(night.DEFAULT, 0.05)}` },
  trialPlanSelected: {
    boxShadow: `0 10px 28px ${alpha(paywall.brand, 0.18)}`,
  },
  trialCta: { boxShadow: `0 12px 28px ${alpha(paywall.brand, 0.3)}` },
});

export type ShadowName = keyof ReturnType<typeof shadows>;
