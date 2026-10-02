import type { AudioSample } from '@/domain/media';

// Voice cloning: where the sample comes from and what the server needs.
// File rules live in domain/media.ts (fileRules.clone).

export const cloneSources = ['upload', 'record'] as const;
export type CloneSource = (typeof cloneSources)[number];

export type CreateCloneInput = {
  name: string;
  language: string;
  sample: AudioSample;
};
