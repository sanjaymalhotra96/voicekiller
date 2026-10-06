import { useSession } from '@/features/auth/AuthProvider';

// Fields this app stores in Supabase user_metadata (user-editable, so
// never plan or usage; those come from public.profiles via useAccount).
type UserMetadata = {
  full_name?: string;
  avatar_url?: string;
  dob?: string; // dd/mm/yy
};

// Display data for the signed-in user, from Supabase user metadata.
export function useCurrentUser() {
  const { session } = useSession();
  const user = session?.user;
  const meta = (user?.user_metadata ?? {}) as UserMetadata;
  const fullName = meta.full_name?.trim() || user?.email?.split('@')[0] || '';

  return {
    id: user?.id,
    email: user?.email ?? '',
    fullName,
    firstName: fullName.split(/\s+/)[0] ?? '',
    avatarUrl: meta.avatar_url ?? null,
    dob: meta.dob ?? '',
  };
}
