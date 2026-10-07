import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth';

// TanStack Query wrappers for every auth action. Screens get
// { mutate, isPending, error } and never call the service directly.

export const useSignUp = () => useMutation({ mutationFn: authService.signUp });

export const useSignIn = () => useMutation({ mutationFn: authService.signIn });

// Google: the session arrives through AuthProvider, which opens the app.
export const useGoogleSignIn = () =>
  useMutation({ mutationFn: authService.signInWithGoogle });

// Apple (iOS): same as Google, through the native Apple sheet.
export const useAppleSignIn = () =>
  useMutation({ mutationFn: authService.signInWithApple });

export const useSignOut = () =>
  useMutation({ mutationFn: authService.signOut });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      authService.verifyOtp(email, token),
  });

export const useResendOtp = () =>
  useMutation({ mutationFn: authService.resendOtp });

export const useSendPasswordReset = () =>
  useMutation({ mutationFn: authService.sendPasswordReset });
