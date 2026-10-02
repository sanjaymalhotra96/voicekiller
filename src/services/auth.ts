import { config } from '@/config';
import { throwIfError } from '@/lib/supabaseResult';
import { supabase } from '@/lib/supabase';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

// Every auth call the app makes. Screens use the hooks in
// features/auth/hooks.ts, never this object directly.
type AuthService = {
  signUp(input: SignUpInput): Promise<void>;
  signIn(input: SignInInput): Promise<void>;
  signOut(): Promise<void>;
  verifyOtp(email: string, token: string): Promise<void>;
  resendOtp(email: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
};

export const authService: AuthService = {
  async signUp({ fullName, email, password }) {
    throwIfError(
      await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      }),
    );
  },
  async signIn({ email, password }) {
    throwIfError(await supabase.auth.signInWithPassword({ email, password }));
  },
  async signOut() {
    throwIfError(await supabase.auth.signOut());
  },
  async verifyOtp(email, token) {
    throwIfError(
      await supabase.auth.verifyOtp({ email, token, type: 'signup' }),
    );
  },
  async resendOtp(email) {
    throwIfError(await supabase.auth.resend({ email, type: 'signup' }));
  },
  async sendPasswordReset(email) {
    throwIfError(
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: config.auth.resetPasswordRedirect,
      }),
    );
  },
};
