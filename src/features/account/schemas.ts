import { z } from 'zod';
import { config } from '@/config';

// Error messages are i18n keys; form fields translate them.
const DOB_RE = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, { error: 'validation.nameRequired' }),
  dob: z
    .string()
    .trim()
    .refine(value => value === '' || DOB_RE.test(value), {
      error: 'validation.dobInvalid',
    }),
});

export const changeEmailSchema = z.object({
  email: z.string().trim().email({ error: 'validation.emailInvalid' }),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, { error: 'validation.currentPasswordRequired' }),
    next: z.string().min(config.auth.minPasswordLength, {
      error: 'validation.passwordShort',
    }),
    confirm: z.string(),
  })
  .refine(data => data.next === data.confirm, {
    path: ['confirm'],
    error: 'validation.passwordMismatch',
  })
  .refine(data => data.next !== data.current, {
    path: ['next'],
    error: 'validation.samePassword',
  });

export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
