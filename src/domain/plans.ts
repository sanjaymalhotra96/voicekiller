// Subscription plan IDs. Must match the check constraint on
// public.profiles.plan. Display data lives in features/account/plans.ts.
const planIds = ['basic', 'studio'] as const;

export type PlanId = (typeof planIds)[number];

export const defaultPlan: PlanId = 'basic';

export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === 'string' && (planIds as readonly string[]).includes(value);
