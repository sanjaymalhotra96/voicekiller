import type { Palette } from '@/theme';

// Colour schemes shared by every input-like box: TextField, TextArea,
// SelectField. Add a tone here and all three get it. Built from the
// active palette: fieldTones(useColors())[tone].
export const fieldTones = (c: Palette) =>
  ({
  // Grey (sheets, forms on white).
  filled: {
    box: 'border-field bg-field',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: c.ink.subtle,
    icon: c.ink.subtle,
  },
  // White (on gradients).
  surface: {
    box: 'border-surface bg-surface',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: c.ink.subtle,
    icon: c.ink.subtle,
  },
  // White with a light border (search, profile, instruction forms).
  outline: {
    box: 'border-line bg-surface',
    focus: 'border-primary bg-surface',
    text: 'text-ink',
    placeholder: c.ink.subtle,
    icon: c.ink.subtle,
  },
  // Soft grey with a hairline (filter rows, read-only cards).
  muted: {
    box: 'border-line-neutral bg-muted',
    focus: 'border-primary bg-muted',
    text: 'text-ink',
    placeholder: c.ink.subtle,
    icon: c.ink.subtle,
  },
  // Warm tint with a peach border (onboarding acting instructions).
  warm: {
    box: 'border-line bg-primary-wash',
    focus: 'border-primary bg-primary-wash',
    text: 'text-primary-ink',
    placeholder: c.ink.subtle,
    icon: c.ink.subtle,
  },
  // Dark editor (Text to Speech).
  night: {
    box: 'border-night-line bg-night-surface',
    focus: 'border-primary bg-night-surface',
    text: 'text-night-text',
    placeholder: c.night.subtle,
    icon: c.night.muted,
  },
  }) as const;

export type FieldTone = keyof ReturnType<typeof fieldTones>;
