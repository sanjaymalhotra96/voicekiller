import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { authService } from '@/services/auth';
import { createPasswordRecoveryService } from '@/services/passwordRecovery';

// TanStack Query wrappers for every auth action. Screens get
// { mutate, isPending, error } and never call the service directly.

export const useSignUp = () => useMutation({ mutationFn: authService.signUp });

export const useSignIn = () => useMutation({ mutationFn: authService.signIn });

// Welcome's social buttons open the trial offer after successful sign-in,
// including when the provider returns an existing account (it skips paid
// accounts straight to the dashboard).
export function useGoogleSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.signInWithGoogle,
    onSuccess: signedIn => {
      if (signedIn) router.replace('/trial-offer');
    },
  });
}

// Apple (iOS): same as Google, through the native Apple sheet.
export function useAppleSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.signInWithApple,
    onSuccess: signedIn => {
      if (signedIn) router.replace('/trial-offer');
    },
  });
}

export const useSignOut = () =>
  useMutation({ mutationFn: authService.signOut });

export function useVerifyOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      authService.verifyOtp(email, token),
    onSuccess: () => router.replace('/trial-offer'),
  });
}

export const useResendOtp = () =>
  useMutation({ mutationFn: authService.resendOtp });

export const useSendPasswordReset = () =>
  useMutation({ mutationFn: authService.sendPasswordReset });

export function useResetPassword(url: string | null) {
  const recovery = useMemo(() => createPasswordRecoveryService(url), [url]);
  const mutation = useMutation({
    mutationFn: ({ password }: { password: string; url: string | null }) =>
      recovery.resetPassword(password),
  });
  return { ...mutation, isValidLink: recovery.isValidLink };
}
