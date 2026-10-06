import { AudioSample, fileRules } from '@/domain';
import { apiUpload, JobControls } from '@/lib/api';
import { prepareUpload } from '@/lib/audioConvert';
import { AppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

// Audio Clean (api-denoise.md). The result is saved in denoise_results,
// which Library reads (services/library.ts).
//
// POST /api/denoise  multipart { file, denoiseOnly: "true" | "false" }
//   (max 200 MB) -> { success, url }. Waits for the cleaning (up to ~10
//   minutes), then saves the file and bills the original duration.
//   denoiseOnly "false" adds studio enhance: studio, studio_max,
//   studio_lifetime and pro_max plans only (other plans get 401).

// The API answers 401 both for an expired sign-in and for a plan without
// enhance. If the session is still valid, it was the plan.
async function whyEnhanceFailed(error: unknown) {
  if (!(error instanceof AppError) || error.code !== 'authRequired') {
    return error;
  }
  const { error: sessionError } = await supabase.auth.getUser();
  return sessionError ? error : new AppError('studioRequired', error.original);
}

export const audioCleanService = {
  async clean({
    file,
    enhance,
    onProgress,
    signal,
  }: { file: AudioSample; enhance: boolean } & JobControls): Promise<void> {
    let response: { success?: boolean; url?: string };
    try {
      response = await apiUpload(
        '/api/denoise',
        {
          file: await prepareUpload(file, fileRules.media),
          denoiseOnly: enhance ? 'false' : 'true',
        },
        { onProgress, signal },
      );
    } catch (error) {
      throw enhance ? await whyEnhanceFailed(error) : error;
    }
    if (response.success === false || !response.url) {
      throw new AppError('jobFailed', response);
    }
  },
};
