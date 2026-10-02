import { extendTailwindMerge } from 'tailwind-merge';
import {
  aspectRatio,
  fontSize,
  letterSpacing,
  lineHeight,
} from '@/theme/typography';

// tailwind-merge only knows Tailwind's default scale. Without this it would
// read `text-body` as a colour and drop it next to `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(fontSize) }],
      leading: [{ leading: Object.keys(lineHeight) }],
      tracking: [{ tracking: Object.keys(letterSpacing) }],
      aspect: [{ aspect: Object.keys(aspectRatio) }],
    },
  },
});

// Join Tailwind classes; later classes win on conflicts (`text-ink` vs `text-primary`).
export const cn = (...classes: Array<string | false | null | undefined>) =>
  twMerge(classes.filter(Boolean).join(' '));
