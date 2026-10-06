import type { PlanId } from '@/domain';
import type { ToneName } from '@/theme';

export type { PlanId } from '@/domain';

// Display data per plan. `limitMinutes` is only a fallback: Settings shows
// the account's real allowance from public.billing when it has one.
export const plans = {
  basic: { limitMinutes: 2, ribbon: 'bg-tone-purple', tone: 'purple' },
  studio: { limitMinutes: 240, ribbon: 'bg-tone-red', tone: 'red' },
} as const satisfies Record<
  PlanId,
  { limitMinutes: number; ribbon: string; tone: ToneName }
>;
