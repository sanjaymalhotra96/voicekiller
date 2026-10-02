import { z } from 'zod';
import { config } from '@/config';

// Error messages are i18n keys; <FormTextField> translates them.
const email = z.string().trim().email({ error: 'validation.emailInvalid' });
const newPassword = z
  .string()
  .min(config.auth.minPasswordLength, { error: 'validation.passwordShort' });

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, { error: 'validation.nameRequired' }),
    email,
    password: newPassword,
    confirmPassword: z.string(),
    agreed: z.boolean().refine(Boolean, { error: 'validation.termsRequired' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'validation.passwordMismatch',
  });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'validation.passwordRequired' }),
});

export const forgotPasswordSchema = z.object({ email });

export const otpSchema = z
  .string()
  .length(config.auth.otpLength, { error: 'validation.otpIncomplete' });

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
