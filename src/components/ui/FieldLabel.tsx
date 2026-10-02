import React from 'react';
import { AppText } from '@/components/ui/AppText';

type Props = {
  label: string;
  // Red asterisk for required fields ("* Instruction Name").
  required?: boolean;
  // `night` on dark screens.
  tone?: 'light' | 'night';
};

// Label above an input.
export function FieldLabel({ label, required = false, tone = 'light' }: Props) {
  return (
    <AppText
      variant="fieldLabel"
      className={tone === 'night' ? 'font-sans text-night-muted' : undefined}
    >
      {required ? <AppText className="text-danger">* </AppText> : null}
      {label}
    </AppText>
  );
}
