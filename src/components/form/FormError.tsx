import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banner } from '@/components/feedback/Banner';
import { errorMessageKey } from '@/lib/errors';

type Props = {
  // Any thrown value (Supabase, network); null/undefined renders nothing.
  error: unknown;
  className?: string;
};

// Translated error banner for a failed request.
export function FormError({ error, className }: Props) {
  const { t } = useTranslation();
  if (!error) {
    return null;
  }
  return <Banner message={t(errorMessageKey(error))} className={className} />;
}
