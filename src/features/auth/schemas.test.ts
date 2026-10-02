import { describe, expect, it } from '@jest/globals';
import {
  changePasswordSchema,
  profileSchema,
} from '@/features/account/schemas';
import { otpSchema, signInSchema, signUpSchema } from '@/features/auth/schemas';

type Parsed = { error?: { issues: { message: string }[] } };
const firstError = (result: Parsed) => result.error?.issues[0]?.message;

const validSignUp = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'password1',
  confirmPassword: 'password1',
  agreed: true,
};

describe('signUpSchema', () => {
  it('accepts valid input and trims the email', () => {
    const result = signUpSchema.parse({
      ...validSignUp,
      email: ' ada@example.com ',
    });
    expect(result.email).toBe('ada@example.com');
  });

  it.each([
    [{ fullName: '  ' }, 'validation.nameRequired'],
    [{ email: 'nope' }, 'validation.emailInvalid'],
    [
      { password: 'short', confirmPassword: 'short' },
      'validation.passwordShort',
    ],
    [{ confirmPassword: 'different1' }, 'validation.passwordMismatch'],
    [{ agreed: false }, 'validation.termsRequired'],
  ])('rejects %p with %p', (patch, key) => {
    const result = signUpSchema.safeParse({ ...validSignUp, ...patch });
    expect(firstError(result)).toBe(key);
  });
});

describe('signInSchema', () => {
  it('requires a password', () => {
    const result = signInSchema.safeParse({ email: 'a@b.co', password: '' });
    expect(firstError(result)).toBe('validation.passwordRequired');
  });
});

describe('otpSchema', () => {
  it('requires the configured length', () => {
    expect(otpSchema.safeParse('123456').success).toBe(true);
    expect(firstError(otpSchema.safeParse('123'))).toBe(
      'validation.otpIncomplete',
    );
  });
});

describe('profileSchema', () => {
  it.each([
    ['', true],
    ['01/02/99', true],
    ['31/12/00', true],
    ['32/01/99', false],
    ['01/13/99', false],
    ['1/2/99', false],
  ])('dob %p valid=%p', (dob, valid) => {
    expect(profileSchema.safeParse({ fullName: 'A', dob }).success).toBe(
      valid,
    );
  });
});

describe('changePasswordSchema', () => {
  it('rejects reusing the current password', () => {
    const result = changePasswordSchema.safeParse({
      current: 'password1',
      next: 'password1',
      confirm: 'password1',
    });
    expect(firstError(result)).toBe('validation.samePassword');
  });
});
