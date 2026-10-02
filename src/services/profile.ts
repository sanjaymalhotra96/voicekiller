import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { config } from '@/config';
import { defaultPlan, isPlanId, PlanId } from '@/domain';
import { AppError, toAppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { isMissingTable, throwIfError } from '@/lib/supabaseResult';

// Profile and account API. Screens use features/account/hooks.ts.
// Updating the Supabase user fires USER_UPDATED, so AuthProvider (and
// useCurrentUser) refresh automatically.

type ProfileInput = { fullName: string; dob: string };

// Server-controlled account data (public.profiles, read-only for users).
export type Account = { plan: PlanId; usageMinutes: number };

const DEFAULT_ACCOUNT: Account = { plan: defaultPlan, usageMinutes: 0 };
// Every user has exactly one photo at this name inside their folder.
const AVATAR_FILE = 'avatar.jpg';

const currentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw toAppError(error);
  }
  return data.user;
};

// Downscale + re-encode on the native side, so the JS heap only ever
// holds a small JPEG (tens of KB) instead of a full camera photo.
async function resizeAvatar(localUri: string) {
  const { size, quality } = config.storage.avatar;
  const context = ImageManipulator.manipulate(localUri).resize({
    width: size,
    height: size,
  });
  const image = await context.renderAsync();
  try {
    const { uri } = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: quality,
    });
    return uri;
  } finally {
    // Free the native bitmaps now instead of waiting for GC.
    image.release();
    context.release();
  }
}

export const profileService = {
  async getAccount(userId: string): Promise<Account> {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan, usage_minutes')
      .eq('id', userId)
      .maybeSingle();
    // Before the migration runs (or for a missing row), use the default.
    if (isMissingTable(error)) {
      return DEFAULT_ACCOUNT;
    }
    throwIfError({ error });
    return data
      ? {
          plan: isPlanId(data.plan) ? data.plan : defaultPlan,
          usageMinutes: Number(data.usage_minutes),
        }
      : DEFAULT_ACCOUNT;
  },

  async update({ fullName, dob }: ProfileInput) {
    throwIfError(
      await supabase.auth.updateUser({ data: { full_name: fullName, dob } }),
    );
  },

  // Supabase emails a confirmation link to the new address.
  async changeEmail(email: string) {
    throwIfError(await supabase.auth.updateUser({ email }));
  },

  // Re-checks the current password first, since updateUser doesn't.
  async changePassword(current: string, next: string) {
    const user = await currentUser();
    const check = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: current,
    });
    if (check.error) {
      throw new AppError('currentPasswordWrong', check.error);
    }
    throwIfError(await supabase.auth.updateUser({ password: next }));
  },

  // Resizes a local image, uploads it over the user's single avatar file
  // and stores its URL on the user. Square crop happens in the picker.
  async uploadAvatar(localUri: string) {
    const user = await currentUser();
    const path = `${user.id}/${AVATAR_FILE}`;
    const bucket = supabase.storage.from(config.storage.avatar.bucket);

    try {
      const resized = await resizeAvatar(localUri);
      const body = await (await fetch(resized)).arrayBuffer();
      const { error } = await bucket.upload(path, body, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      throw new AppError('uploadFailed', error);
    }

    // Same path every time, so bust image caches with a version param.
    const { publicUrl } = bucket.getPublicUrl(path).data;
    throwIfError(
      await supabase.auth.updateUser({
        data: { avatar_url: `${publicUrl}?v=${Date.now()}` },
      }),
    );

    // Best effort: remove files from the old one-file-per-upload scheme.
    const { data: files } = await bucket.list(user.id);
    const stale = (files ?? [])
      .filter(file => file.name !== AVATAR_FILE)
      .map(file => `${user.id}/${file.name}`);
    if (stale.length > 0) {
      await bucket.remove(stale);
    }
  },

  // Runs public.delete_user() (see supabase/migrations), then signs out.
  async deleteAccount() {
    throwIfError(await supabase.rpc('delete_user'));
    await supabase.auth.signOut({ scope: 'local' });
  },
};
