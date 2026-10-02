import { useTranslation } from 'react-i18next';
import { config } from '@/config';

// Zod messages are i18n keys ("validation.emailInvalid"). Translate them,
// filling rule values like {{min}} from config.
export function useFieldError() {
  const { t } = useTranslation();
  return (key?: string) =>
    key ? t(key as never, { min: config.auth.minPasswordLength }) : undefined;
}
