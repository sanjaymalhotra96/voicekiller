// Acting Instruction samples shown as scrolling pills on onboarding step 1.
// Every pill has a recording, so each one plays when tapped. Labels are
// in en.json under onboarding.voices.samples.<id>.
import type en from '@/i18n/locales/en.json';

// Only ids with a label in en.json compile.
export type SampleId = keyof (typeof en)['onboarding']['voices']['samples'];

export type OnboardingSample = {
  id: SampleId;
  audioUrl: string;
};

const BASE =
  'https://ttsfiles.nyc3.digitaloceanspaces.com/ttsfiles/best-samples/prompt/';

const sample = (id: SampleId, file: string): OnboardingSample => ({
  id,
  audioUrl: `${BASE}${file}.mp3`,
});

// Five rows that alternate direction; each row loops its own pills.
export const sampleRows: OnboardingSample[][] = [
  [
    sample('happy', 'emotions-happy-803aec06-24fc-4075-aaa8-d04ab29a4944'),
    sample('angry', 'emotions-angry-5bd0233c-15cf-475c-9666-0af9019fb1d0'),
    sample(
      'sarcastic',
      'emotions-sarcasm-559101aa-9855-4999-8de1-7e7ffdd7c6b7',
    ),
    sample('excited', 'emotions-excited-20a641e8-4b32-480b-abf6-b799a28d264c'),
    sample('crying', 'emotions-crying-32f873a5-6e6f-4983-ba97-d642f5259f6b'),
    sample('pirate', 'characters-pirate-991563c7-f43b-4f87-b96e-b23119801882'),
  ],
  [
    sample('scared', 'emotions-scared-88fc1cc6-8fba-414d-97cb-fc05fa0513f7'),
    sample(
      'laughing',
      'emotions-laughter-a4aa4a41-301b-4d05-88dc-1361f10d7ae8',
    ),
    sample('calm', 'emotions-calm-c2ff51e4-8be0-4806-a6c7-932237dbbcc3'),
    sample(
      'evilVillain',
      'characters-evil-villain-2133ab8d-478c-4c88-92b3-b981a5239cfe',
    ),
    sample(
      'dramatic',
      'emotions-dramatic-fae86ead-8145-4cd3-9745-d55dfb69592a',
    ),
    sample(
      'confident',
      'emotions-confident-be120bfd-fe05-4e7f-b15c-da4a4e276366',
    ),
  ],
  [
    sample('nervous', 'emotions-nervous-fb388c54-e48e-4436-902d-8e0f4dcb9f7a'),
    sample(
      'romantic',
      'emotions-romantic-8128afb2-2074-4fbd-b56c-9a9b701f1986',
    ),
    sample(
      'sleepy',
      'characters-sleepyhead-d752cc7f-a9f2-4f26-92bf-a6c2574d1a56',
    ),
    sample(
      'energetic',
      'emotions-energetic-a82313da-a958-41ce-b9a7-67688abcfa47',
    ),
    sample(
      'madScientist',
      'characters-mad-scientist-6b58633c-3f5d-48ad-b153-5e1f29212cd8',
    ),
    sample(
      'horror',
      'situations-horror-narration-52d00bda-155f-4e3d-a5ed-313898ec50ba',
    ),
  ],
  [
    sample(
      'surprised',
      'emotions-surprised-ca22bd27-f034-4e65-ae16-49511315e2be',
    ),
    sample('awkward', 'emotions-awkward-803182e9-1a93-41f8-bb81-5e34f3fd0da3'),
    sample('shocked', 'emotions-shocking-e31e9320-05f9-46be-972f-c54450afaaa9'),
    sample('tired', 'emotions-tired-474bfe59-99b8-4e77-949a-2d6c45a5be5d'),
    sample(
      'santaClaus',
      'characters-santa-claus-6d7193ee-5677-42fc-a1ab-c1d8ad99b49d',
    ),
    sample('curious', 'emotions-curious-22813e4f-327c-4b2f-b23a-8f92d5212e64'),
  ],
  [
    sample('playful', 'emotions-playful-2c4f5b30-1ba0-401b-9c8e-dd1ccd11f71f'),
    sample('serious', 'emotions-serious-adb88d13-dbc3-4da6-a7a7-fb1e6bfb2dc6'),
    sample('sad', 'emotions-sad-8e965f40-7198-42c5-b4f7-0075854af5ce'),
    sample('rap', 'situations-rap-cd5891d1-7661-4cf7-93f2-542351f2009c'),
    sample(
      'disappointed',
      'emotions-disappointed-b1db9001-8359-4be0-828b-f32b7cbf1553',
    ),
    sample(
      'sportsCommentator',
      'characters-sports-commentator-4121ec1e-fd3f-4ba1-b31d-049ca36e0526',
    ),
  ],
];

// Lookup by id for the screen's tap handler.
export const samplesById = new Map<string, OnboardingSample>(
  sampleRows.flat().map(item => [item.id, item]),
);
