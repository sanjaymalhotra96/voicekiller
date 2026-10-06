import { config } from '@/config';
import type { GenerateSpeechRequest, SpeechRequest } from '@/domain';
import { apiAudio, apiRequest, JobControls } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { pollJob } from '@/lib/poll';
import { isV2Clone, toMetadata } from '@/services/speechMetadata';

// Speech synthesis through the web API.
//
// POST /api/tts                { metadata }  -> { jobId }
// POST /api/tts/clone          { metadata }  -> { jobId }   (V2 clones)
// GET  /api/tts/status/:jobId  -> { status, label, result?: { url, id,
//                                   file_name }, error? }
//   status: generating | uploading | counting | saving | processing |
//           done | error. The finished file is saved in generated_files
//           (Library).
// POST /api/tts/preview        { metadata }  -> audio/mpeg (not saved)
// POST /api/tts/clone/preview  { metadata }  -> audio/mpeg (V2 clones)

type JobStatus = {
  status: string;
  error?: string;
};

// Characters the preview reads, like the web dashboard.
const previewLength = 50;

export const speechService = {
  // A short sample, saved on the device only. Returns its file uri.
  preview(request: SpeechRequest): Promise<string> {
    const v2 = isV2Clone(request);
    return apiAudio(v2 ? '/api/tts/clone/preview' : '/api/tts/preview', {
      body: {
        metadata: toMetadata({
          ...request,
          script: request.script.slice(0, previewLength),
        }),
      },
      // A V2 clone preview can take up to ~160 seconds.
      timeoutMs: v2 ? 3 * 60_000 : 60_000,
    });
  },

  // Starts the job and resolves once the file is saved in Library.
  // `signal` only stops the waiting: the server still saves the file.
  async generate({
    signal,
    ...request
  }: GenerateSpeechRequest & Pick<JobControls, 'signal'>): Promise<void> {
    const v2 = isV2Clone(request);
    log('api', `generate with ${v2 ? 'V2 clone' : 'tts'}`, {
      ...toMetadata(request),
      script: `${request.script.length} characters`,
    });
    const { jobId } = await apiRequest<{ jobId: string }>(
      v2 ? '/api/tts/clone' : '/api/tts',
      {
        method: 'POST',
        body: {
          metadata: {
            ...toMetadata(request),
            fileName: request.title,
            campaign_name: request.campaignName,
          },
        },
      },
    );

    await pollJob(
      async () => {
        const job = await apiRequest<JobStatus>(
          `/api/tts/status/${encodeURIComponent(jobId)}`,
          { signal },
        );
        if (job.status === 'error') {
          throw new AppError('jobFailed', job.error);
        }
        return job.status === 'done' ? true : undefined;
      },
      { ...(v2 ? config.jobs.cloneSpeech : config.jobs.speech), signal },
    );
  },
};
