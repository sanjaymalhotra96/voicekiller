import { audio } from '@/assets';

// Preset voices on onboarding step 3. `sample` is the real person;
// `voiceId` is the clone the server speaks with. Names are proper nouns,
// so they stay here rather than in en.json.
export type CloneVoice = {
  id: string;
  name: string;
  voiceId: string;
  sample: number;
};

export const cloneVoices: CloneVoice[] = [
  {
    id: 'musk',
    name: 'Musk',
    voiceId: 'voicekiller__elon-musk',
    sample: audio.onboardingCloneMusk,
  },
  {
    id: 'trump',
    name: 'Trump',
    voiceId: 'voicekiller__trump',
    sample: audio.onboardingCloneTrump,
  },
  {
    id: 'obama',
    name: 'Obama',
    voiceId: 'voicekiller__obama',
    sample: audio.onboardingCloneObama,
  },
  {
    id: 'ronaldo',
    name: 'Ronaldo',
    voiceId: 'voicekiller__ronaldo',
    sample: audio.onboardingCloneRonaldo,
  },
];

// Line the box starts with. Not translated: it must match the words in
// the bundled preset clip.
export const defaultCloneScript = 'This summer, one app changes everything.';

// One take per voice + line.
export const cloneTakeKey = (voice: CloneVoice, script: string) =>
  `${voice.voiceId}|${script.trim()}`;

// Takes bundled with the app: Musk reading the default line plays at once.
export const clonePresets: Record<string, number> = {
  [cloneTakeKey(cloneVoices[0], defaultCloneScript)]:
    audio.onboardingCloneMuskPreset,
};
