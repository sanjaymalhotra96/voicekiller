// Onboarding step 4 (voice changer): one recording of a normal voice and
// the same take converted into each preset voice. Streamed from the
// onboarding CDN, nothing generated. Names and initials are proper nouns,
// so they stay here rather than in en.json.
const BASE = 'https://onboard.voicekiller.com/chaner/';

export const changerBeforeUrl = `${BASE}main.wav`;

// Still waveform drawn on the Before row (heights in dp).
export const changerBeforeWave = [
  8, 14, 10, 18, 12, 9, 16, 11, 14, 8, 12, 10, 15, 9,
];

export type ChangerVoice = {
  id: string;
  name: string;
  initials: string;
  audioUrl: string;
  // Waveform on the After row, shaped to suit the voice.
  wave: number[];
};

export const changerVoices: ChangerVoice[] = [
  {
    id: 'ronaldo',
    name: 'Ronaldo',
    initials: 'CR',
    audioUrl: `${BASE}Ronaldo.wav`,
    wave: [20, 30, 32, 24, 32, 28, 32, 22, 30, 32, 26, 30, 32, 24],
  },
  {
    id: 'trump',
    name: 'Trump',
    initials: 'DT',
    audioUrl: `${BASE}trump.wav`,
    wave: [10, 22, 30, 18, 32, 26, 14, 30, 20, 28, 12, 24, 30, 16],
  },
  {
    id: 'elon',
    name: 'Elon',
    initials: 'EM',
    audioUrl: `${BASE}Elon.wav`,
    wave: [8, 14, 20, 12, 18, 10, 22, 14, 9, 18, 12, 16, 10, 8],
  },
  {
    id: 'obama',
    name: 'Obama',
    initials: 'BO',
    audioUrl: `${BASE}obama.wav`,
    wave: [12, 18, 24, 16, 22, 20, 26, 18, 24, 14, 20, 22, 16, 12],
  },
];
