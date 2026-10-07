// Onboarding step 5 (audio clean): the same 15 s recording before and
// after cleaning. Streamed from the onboarding CDN; both are the same
// length so they can play in lockstep.
const BASE = 'https://onboard.voicekiller.com/bg/';

export const noisyAudioUrl = `${BASE}audio1.mp3`;
export const cleanAudioUrl = `${BASE}audio1-en.wav`;

// Speech shape (dp) shown when clean.
export const cleanWave = [
  4, 4, 12, 30, 52, 66, 42, 28, 58, 74, 46, 14, 4, 4, 10, 32, 54, 70, 60, 36,
  22, 46, 62, 40, 16, 4, 4, 20, 44, 66, 52, 30, 10, 4,
];

// The same speech buried under a high, ragged noise floor.
export const noisyWave = cleanWave.map((h, i) => {
  const noise = 22 + ((i * 53) % 19) + ((i * 29) % 11);
  return Math.min(96, Math.max(h, noise) + ((i * 31) % 13));
});
