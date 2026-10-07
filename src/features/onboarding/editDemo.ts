import { palette } from '@/theme';

// Onboarding step 6 (speech editor): a line recorded with a wrong word,
// and the same take after the word was fixed by editing the transcript.
// Streamed from the onboarding CDN.
const BASE = 'https://onboard.voicekiller.com/editor/';

export const editorOriginalUrl = `${BASE}original1.mp3`;
export const editorFixedUrl = `${BASE}ai1.mp3`;

export const editorWrongWord = 'country';
export const editorRightWord = 'wife';

// The transcript; `null` marks where the edited word goes (every instance
// is fixed with one tap). Not translated: it is what the recordings say.
export const editorParts: (string | null)[] = [
  'Ask not what your ',
  null,
  ' can do for you, ask what you can do for your ',
  null,
  '.',
];

export const editorWave = [
  8, 16, 22, 12, 26, 18, 10, 24, 28, 14, 20, 26, 12, 18, 22, 10,
];

// Bars where the edited word is spoken get their own colour.
const isEditedBar = (i: number) => (i >= 3 && i <= 4) || (i >= 13 && i <= 14);

const waveColors = (base: string, mark: string) =>
  editorWave.map((_, i) => (isEditedBar(i) ? mark : base));

export const editorOriginalColors = waveColors(
  palette.ink.inactive,
  palette.primary.dark,
);
export const editorFixedColors = waveColors(
  palette.primary.DEFAULT,
  palette.ink.DEFAULT,
);
