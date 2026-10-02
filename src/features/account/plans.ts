import type { PlanId } from '@/domain';
import type { ToneName } from '@/theme';

export type { PlanId } from '@/domain';

// Display data per plan. Minute limits are shown in Settings; the server
// is the source of truth for enforcing them.
export const plans = {
  basic: { limitMinutes: 2, ribbon: 'bg-tone-purple', tone: 'purple' },
  studio: { limitMinutes: 240, ribbon: 'bg-tone-red', tone: 'red' },
} as const satisfies Record<
  PlanId,
  { limitMinutes: number; ribbon: string; tone: ToneName }
>;
