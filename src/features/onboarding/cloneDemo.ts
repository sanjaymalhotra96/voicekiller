const BASE = 'https://onboard.voicekiller.com/clone/';

// Preset voices on onboarding step 3. `sample` is the real person;
// `voiceId` is the clone the server speaks with. Names are proper nouns,
// so they stay here rather than in en.json.
export type CloneVoice = {
  id: string;
  name: string;
  voiceId: string;
  sample: string;
};

export const cloneVoices: CloneVoice[] = [
  {
    id: 'musk',
    name: 'Musk',
    voiceId: 'voicekiller__elon-musk',
    sample: `${BASE}musk.mp3`,
  },
  {
    id: 'trump',
    name: 'Trump',
    voiceId: 'voicekiller__trump',
    sample: `${BASE}trump.mp3`,
  },
  {
    id: 'obama',
    name: 'Obama',
    voiceId: 'voicekiller__obama',
    sample: `${BASE}obama.mp3`,
  },
  {
    id: 'ronaldo',
    name: 'Ronaldo',
    voiceId: 'voicekiller__ronaldo',
    sample: `${BASE}ronaldo.mp3`,
  },
];

// Line the box starts with.
export const defaultCloneScript = 'This summer, one app changes everything.';

// One take per voice + line.
export const cloneTakeKey = (voice: CloneVoice, script: string) =>
  `${voice.voiceId}|${script.trim()}`;
