import { config } from '@/config';
import { apiAudio } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';

// Onboarding demos, called before sign-in with fixed keys from Expo config
// instead of a user token. Each returns a uri to play: a saved file, or
// the server's link to a ready-made sample.

function keyOrThrow(key: string, envName: string) {
  if (!key) {
    log('api', `${envName} is not set in Expo config`);
    throw new AppError('serviceUnavailable', `${envName} missing`);
  }
  return key;
}

// POST /api/app-onboard/acting
//   Authorization: Bearer <ONBOARDING_ACTING_KEY>
//   { instructions: string }  ->  audio/mpeg
// The server reads its own fixed demo script with the given acting
// instructions.
export function generateOnboardingActing(
  instructions: string,
  signal?: AbortSignal,
) {
  return apiAudio('/api/app-onboard/acting', {
    body: { instructions },
    token: keyOrThrow(
      config.onboarding.actingKey,
      'ONBOARDING_ACTING_KEY',
    ),
    signal,
  });
}

// POST /api/app-onboard/clone
//   Authorization: Bearer <ONBOARDING_CLONE_KEY>
//   { script: string, voiceid: string }  ->  audio/mpeg
// `voiceid` is one of the preset clones (features/onboarding/cloneDemo).
export function generateOnboardingClone(
  script: string,
  voiceId: string,
  signal?: AbortSignal,
) {
  return apiAudio('/api/app-onboard/clone', {
    body: { script, voiceid: voiceId },
    token: keyOrThrow(
      config.onboarding.cloneKey,
      'ONBOARDING_CLONE_KEY',
    ),
    signal,
  });
}
