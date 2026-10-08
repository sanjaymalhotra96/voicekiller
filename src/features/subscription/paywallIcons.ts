import { createLucideIcon } from 'lucide-react-native';

// The paywall's feature icons, traced from the design. Its shapes differ
// from lucide's stock AudioLines / Users / Sparkles / ArrowRightLeft /
// Pencil, so they are drawn here on lucide's 24px grid and render like
// any lucide icon (size, color, strokeWidth).

export const VoicesIcon = createLucideIcon('paywall-voices', [
  ['path', { d: 'M3 10v3.5', key: 'a' }],
  ['path', { d: 'M7.5 6v12', key: 'b' }],
  ['path', { d: 'M12 2.75v18.5', key: 'c' }],
  ['path', { d: 'M16.5 6v12', key: 'd' }],
  ['path', { d: 'M20.5 10v3.5', key: 'e' }],
]);

export const ClonesIcon = createLucideIcon('paywall-clones', [
  ['circle', { cx: '8.5', cy: '8', r: '3.75', key: 'a' }],
  ['path', { d: 'M2.5 21.5V20a6.5 6.5 0 0 1 13 0v1.5', key: 'b' }],
  ['path', { d: 'M16.5 4.25a3.9 3.9 0 0 1 1 7.6', key: 'c' }],
  ['path', { d: 'M18.5 16a6.5 6.5 0 0 1 3.5 5.5', key: 'd' }],
]);

export const CleanIcon = createLucideIcon('paywall-clean', [
  [
    'path',
    {
      d: 'M11.8 2Q12.9 7.9 18.8 9Q12.9 10.1 11.8 16Q10.7 10.1 4.8 9Q10.7 7.9 11.8 2Z',
      key: 'a',
    },
  ],
  // Small solid star: an outline plus a smaller one inside it, so the
  // stroke covers it without a fill (lucide sets fill="none").
  [
    'path',
    {
      d: 'M19.3 15.6Q19.8 17.7 21.9 18.2Q19.8 18.7 19.3 20.8Q18.8 18.7 16.7 18.2Q18.8 17.7 19.3 15.6Z',
      key: 'b',
    },
  ],
  ['path', { d: 'M19.3 17.2L20.3 18.2L19.3 19.2L18.3 18.2Z', key: 'c' }],
]);

export const ChangerIcon = createLucideIcon('paywall-changer', [
  ['path', { d: 'M5.75 3 1.5 7.5 5.75 12', key: 'a' }],
  ['path', { d: 'M1.5 7.5H16a4 4 0 0 1 4 4v.5', key: 'b' }],
  ['path', { d: 'M17.75 11.5 22 16l-4.25 4.5', key: 'c' }],
  ['path', { d: 'M22 16H7a4 4 0 0 1-4-4v-1', key: 'd' }],
]);

export const EditorIcon = createLucideIcon('paywall-editor', [
  ['path', { d: 'M2.5 20.5v-4l13-13 5 5-13 12z', key: 'a' }],
  ['path', { d: 'M14.25 4.75l5 5', key: 'b' }],
]);
