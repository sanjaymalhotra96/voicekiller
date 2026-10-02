import { palette } from '@/theme';

// Colour schemes shared by every input-like box: TextField, TextArea,
// SelectField. Add a tone here and all three get it.
export const fieldTones = {
  // Grey (sheets, forms on white).
  filled: {
    box: 'border-field bg-field',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: palette.ink.subtle,
    icon: palette.ink.subtle,
  },
  // White (on gradients).
  surface: {
    box: 'border-surface bg-surface',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: palette.ink.subtle,
    icon: palette.ink.subtle,
  },
  // White with a light border (search, profile, instruction forms).
  outline: {
    box: 'border-line bg-surface',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: palette.ink.subtle,
    icon: palette.ink.subtle,
  },
  // Soft grey with a hairline (filter rows, read-only cards).
  muted: {
    box: 'border-line-neutral bg-muted',
    focus: 'border-primary bg-muted',
    text: 'text-ink',
    placeholder: palette.ink.subtle,
    icon: palette.ink.subtle,
  },
  // Dark editor (Text to Speech).
  night: {
    box: 'border-night-line bg-night-surface',
    focus: 'border-primary bg-night-surface',
    text: 'text-night-text',
    placeholder: palette.night.subtle,
    icon: palette.night.muted,
  },
} as const;

export type FieldTone = keyof typeof fieldTones;
