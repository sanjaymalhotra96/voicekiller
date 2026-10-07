// Feelings offered on onboarding step 2. Tapping one fills the Acting
// Instructions box with its text, which is what the server is sent.
// Label and text are in en.json: onboarding.direct.tags.<id>.label/.text.
export const directingTagIds = [
  'awkward',
  'crying',
  'laugh',
  'sarcasm',
  'relieved',
  'excited',
] as const;

export type DirectingTagId = (typeof directingTagIds)[number];
