import { config } from '@/config';
import { AudioSample, fileRules } from '@/domain';
import { apiRequest, apiUpload, JobControls, studioOnly } from '@/lib/api';
import { prepareUpload } from '@/lib/audioConvert';
import { AppError } from '@/lib/errors';
import { pollJob } from '@/lib/poll';

// Voice Changer (Studio plans). The result is saved in voice_conversion,
// which Library reads (services/library.ts).
//
// POST /api/conversion  multipart { audioFile1: speech, audioFile2: voice }
//   -> { data: { id, status } }
// GET  /api/conversion/status/:id
//   -> { status: IN_QUEUE | IN_PROGRESS | COMPLETED | FAILED | CANCELLED }
//   The call that sees COMPLETED bills and saves the result, so polling
//   stops right there (another call would bill again). It is also why this
//   job takes no cancel signal: if nobody polled, the result would never
//   be saved.

export const voiceChangerService = {
  async convert({
    source,
    target,
    onProgress,
  }: { source: AudioSample; target: AudioSample } & Pick<JobControls, 'onProgress'>) {
    const { data } = await apiUpload<{ data: { id: string } }>(
      '/api/conversion',
      {
        audioFile1: await prepareUpload(source, fileRules.changer),
        audioFile2: await prepareUpload(target, fileRules.changer),
      },
      { codes: studioOnly, onProgress },
    );
    await pollJob(async () => {
      const job = await apiRequest<{ status: string; error?: string }>(
        `/api/conversion/status/${encodeURIComponent(data.id)}`,
        { codes: studioOnly },
      );
      if (job.status === 'COMPLETED') return true;
      if (job.status === 'FAILED' || job.status === 'CANCELLED') {
        throw new AppError('jobFailed', job.error);
      }
      return undefined;
    }, config.jobs.conversion);
  },
};
