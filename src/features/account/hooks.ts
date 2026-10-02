import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from '@/features/auth/AuthProvider';
import { queryKeys } from '@/lib/queryKeys';
import { defaultPlan } from '@/domain';
import { Account, profileService } from '@/services/profile';

// Plan and usage for the signed-in user. Defaults to Basic while loading.
export function useAccount(): Account & { isLoading: boolean } {
  const userId = useSession().session?.user.id;
  const query = useQuery({
    queryKey: queryKeys.account.profile(userId),
    queryFn: () => profileService.getAccount(userId as string),
    enabled: !!userId,
  });
  return {
    plan: query.data?.plan ?? defaultPlan,
    usageMinutes: query.data?.usageMinutes ?? 0,
    isLoading: query.isPending,
  };
}

// TanStack Query wrappers for account actions.

export const useUpdateProfile = () =>
  useMutation({ mutationFn: profileService.update });

export const useChangeEmail = () =>
  useMutation({ mutationFn: profileService.changeEmail });

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      profileService.changePassword(current, next),
  });

export const useUploadAvatar = () =>
  useMutation({ mutationFn: profileService.uploadAvatar });

export const useDeleteAccount = () =>
  useMutation({ mutationFn: profileService.deleteAccount });
