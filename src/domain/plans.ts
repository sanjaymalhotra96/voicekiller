// Plans the app shows. Display data lives in features/account/plans.ts.
export type PlanId = 'basic' | 'studio';

export const defaultPlan: PlanId = 'basic';

// public.users.account_type (free, pro, pro_max, studio, studio_max,
// studio_lifetime) -> the plan shown. Only Studio is sold in the app, so
// every Studio type shows as Studio and everything else as Basic.
export const planFromAccountType = (accountType: unknown): PlanId =>
  typeof accountType === 'string' && accountType.startsWith('studio')
    ? 'studio'
    : defaultPlan;
