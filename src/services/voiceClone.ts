import { randomUUID } from 'expo-crypto';
import { config } from '@/config';
import { CreateCloneInput, fileExtension, Voice } from '@/domain';
import type { TableRow } from '@/lib/database.types';
import { AppError, toAppError } from '@/lib/errors';
import { invokeFunction } from '@/lib/functions';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/lib/uploadFile';
import { voiceFromRow } from '@/services/ownVoices';

// Voice Clone. Listing, renaming and deleting clones: services/ownVoices.
//
// Contract (implement in supabase/functions):
//   voice-clone-create  body: { name, language, samplePath }
//                       samplePath is in the private voice-samples bucket.
//                       200 -> { voice: voices row }  (owner_id = caller,
//                       source = 'cloned')

const currentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw toAppError(error);
  }
  return data.user.id;
};

export const clonesService = {
  // Streams the sample to Storage, then asks the server to clone it.
  async create({ name, language, sample }: CreateCloneInput): Promise<Voice> {
    const userId = await currentUserId();
    const ext = fileExtension(sample.name) || 'm4a';
    const samplePath = `${userId}/${randomUUID()}.${ext}`;

    await uploadFile({
      bucket: config.clone.sampleBucket,
      path: samplePath,
      file: sample,
    }).promise;

    const { voice } = await invokeFunction<{ voice: TableRow<'voices'> }>(
      config.functions.createClone,
      { name, language, samplePath },
    );
    const mapped = voiceFromRow(voice);
    if (!mapped) {
      throw new AppError('unknown', voice);
    }
    return mapped;
  },
};
