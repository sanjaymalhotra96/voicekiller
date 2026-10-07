// Type tokens shared by tailwind.config.js and utils/cn.ts.
// Tailwind: text-body, text-heading, leading-lead, tracking-badge, ...
// Standard Tailwind sizes (text-xs/sm/base/lg/2xl) are used as-is.
// The type scale itself (which token each text style uses) lives in
// components/ui/AppText.tsx.

const fontSize = {
  micro: '8px', // ribbon badge under avatar
  tiny: '9px', // timestamps, plan ribbon
  tag: '11px', // pill tags
  small: '13px', // tab labels, small labels
  body: '15px', // paragraph text, inputs
  heading: '26px', // screen titles
  display: '30px', // welcome / verify titles
  badge: '34px', // OTP "****" bubble
  hero: '44px', // onboarding titles
};

const lineHeight = {
  lead: '26px',
  badge: '40px',
  hero: '46px',
};

const letterSpacing = {
  badge: '6px',
  hero: '-1.3px',
};

const aspectRatio = {
  tile: '1.25', // auth tile buttons
};

module.exports = { fontSize, lineHeight, letterSpacing, aspectRatio };
