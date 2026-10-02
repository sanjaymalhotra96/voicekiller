import type { ParseKeys } from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';
import { AppText, TextVariant } from '@/components/ui/AppText';
import { cn } from '@/utils';

type Props = {
  // Type-checked against en.json.
  i18nKey: ParseKeys;
  values?: Record<string, unknown>;
  variant?: TextVariant;
  className?: string;
  // Handler and extra classes for a <link> tag in the string.
  onLinkPress?: () => void;
  linkClassName?: string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
};

// Translated sentence with shared inline tags, so screens never style
// them by hand. Supported tags in en.json:
//   <bold>…</bold>   bold ink text
//   <brand>…</brand> primary colour
//   <link>…</link>   tappable (onLinkPress)
export function TransText({
  i18nKey,
  values,
  variant = 'subtitle',
  className,
  onLinkPress,
  linkClassName,
  numberOfLines,
  adjustsFontSizeToFit,
}: Props) {
  return (
    <AppText
      variant={variant}
      className={className}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
    >
      <Trans
        // Checked by the ParseKeys prop above; the cast stops TS expanding
        // Trans's key union, which is too large for the compiler.
        i18nKey={i18nKey as never}
        values={values}
        components={{
          bold: (
            <AppText variant={variant} className="font-sans-bold text-ink" />
          ),
          brand: <AppText variant={variant} className="text-primary" />,
          link: (
            <AppText
              variant={variant}
              accessibilityRole="link"
              onPress={onLinkPress}
              className={cn('font-sans-semibold text-ink', linkClassName)}
            />
          ),
        }}
      />
    </AppText>
  );
}
