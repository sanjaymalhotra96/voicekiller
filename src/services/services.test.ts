import { describe, expect, it } from '@jest/globals';
import { defaultSpeechSettings, SpeechRequest, Voice } from '@/domain';
import { mergePage, pageOf, toFetched } from '@/services/libraryPaging';
import { isV2Clone, toMetadata } from '@/services/speechMetadata';
import { toSegments } from '@/services/transcriptFile';
import { fileNameFromUrl } from '@/utils';

const voice = (overrides: Partial<Voice>): Voice => ({
  id: 'x',
  voice: 'voice-id',
  name: 'Name',
  description: '',
  provider: 'IN',
  gender: 'female',
  accent: 'en-US',
  language: 'English (United States)',
  source: 'library',
  previewUrl: 'https://example.com/sample.mp3',
  createdAt: null,
  plan: null,
  recordId: null,
  cloneEngine: null,
  ...overrides,
});

const request = (overrides: Partial<SpeechRequest>): SpeechRequest => ({
  script: 'Hello there',
  voice: voice({}),
  emotion: null,
  settings: { ...defaultSpeechSettings, speed: 2, delivery: 'creative' },
  instructions: 'Calm and warm',
  ...overrides,
});

describe('Text to Speech request body', () => {
  it('sends Inworld voices speed (capped at 1.5), delivery and voiceOptions', () => {
    const body = toMetadata(request({}));
    expect(body).toMatchObject({
      script: 'Hello there',
      voice: 'voice-id',
      provider: 'IN',
      language: 'en-US',
      speed: 1.5,
      deliveryMode: 'CREATIVE',
      voiceOptions: { speed: 1.5, volume: 1, pitch: 0 },
      character_count: 11,
    });
    // Inworld takes no acting instructions.
    expect(body).not.toHaveProperty('instructions');
  });

  it('sends Gemini voices instructions only, never speed', () => {
    const body = toMetadata(
      request({ voice: voice({ provider: 'Gemini', plan: 'studio' }) }),
    );
    expect(body).toMatchObject({
      provider: 'Gemini',
      instructions: 'Calm and warm',
      plan: 'studio',
    });
    expect(body).not.toHaveProperty('speed');
    expect(body).not.toHaveProperty('voiceOptions');
  });

  it('sends the emotion to Minimax voices', () => {
    const body = toMetadata(
      request({ voice: voice({ provider: 'v4' }), emotion: 'happy' }),
    );
    expect(body.voiceOptions).toMatchObject({ emotion: 'happy', speed: 2 });
  });

  it('sends the sample and engine for clones', () => {
    const clone = voice({
      provider: 'custom',
      cloneEngine: 'V3',
      previewUrl: 'https://s/clone.mp3',
    });
    expect(toMetadata(request({ voice: clone }))).toMatchObject({
      provider: 'custom',
      CloneProvider: 'V3',
      sample: 'https://s/clone.mp3',
    });
  });

  it('turns a V2 emotion into the 8 manual sliders', () => {
    const v2 = request({
      voice: voice({ provider: 'custom', cloneEngine: 'V2' }),
      emotion: 'sad',
    });
    expect(isV2Clone(v2)).toBe(true);
    expect(toMetadata(v2).modelData).toEqual({
      selectedModel: 'V2',
      method: 'manual',
      manualControls: [0, 0, 0.8, 0, 0, 0, 0, 0],
    });
  });
});

describe('Speech to Text transcript file', () => {
  it('reads timed sentences', () => {
    expect(
      toSegments({ sentences: [{ text: 'Hi', start: 0, end: 1.5 }] }, null),
    ).toEqual([{ text: 'Hi', start: 0, end: 1.5 }]);
  });

  it('reads millisecond timings', () => {
    expect(
      toSegments(
        { segments: [{ transcript: 'Hi', start_ms: 1000, end_ms: 2500 }] },
        null,
      ),
    ).toEqual([{ text: 'Hi', start: 1, end: 2.5 }]);
  });

  it('uses the translation when one was asked for', () => {
    const srt =
      '1\n00:00:01,000 --> 00:00:02,500\nBonjour\n\n2\n00:00:03,000 --> 00:00:04,000\nMonde';
    expect(
      toSegments(
        {
          sentences: [{ text: 'Hello', start: 0, end: 1 }],
          translations: { french: srt },
        },
        'french',
      ),
    ).toEqual([
      { start: 1, end: 2.5, text: 'Bonjour' },
      { start: 3, end: 4, text: 'Monde' },
    ]);
  });

  it('falls back to plain text, then to nothing', () => {
    expect(toSegments({ text: 'Just text' }, null)).toEqual([
      { start: 0, end: 0, text: 'Just text' },
    ]);
    expect(toSegments({}, null)).toEqual([]);
  });
});

describe('file names', () => {
  it('takes the name of a URL without folders, query or extension', () => {
    expect(
      fileNameFromUrl('https://x/a/conversion/conversion_3f5c.mp3?v=1'),
    ).toBe('conversion_3f5c');
    expect(fileNameFromUrl('https://x/My%20Clip.final.wav')).toBe(
      'My Clip.final',
    );
    expect(fileNameFromUrl('https://x/bad%E0name.mp3')).toBe('bad%E0name');
    expect(fileNameFromUrl('')).toBe('');
  });
});

describe('Library paging', () => {
  const rows = [
    {
      id: 1,
      file_name: 'Old interview',
      url: 'u1',
      created_at: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 2,
      file_name: 'New podcast',
      url: 'u2',
      created_at: '2026-10-03T10:00:00.000Z',
    },
    {
      id: 3,
      file_name: 'Mid podcast',
      url: 'u3',
      created_at: '2026-10-02T10:00:00+00:00',
    },
  ];

  it('pages a whole list newest first, by time not text', () => {
    const { rows: page, full } = pageOf(rows, 'file_name', {
      cursor: null,
      search: '',
      limit: 2,
    });
    expect(page.map(r => r.id)).toEqual([2, 3]);
    expect(full).toBe(true);
  });

  it('applies the cursor and the search', () => {
    const cursor = { createdAt: '2026-10-02T10:00:00.000Z', seen: [] };
    expect(
      pageOf(rows, 'file_name', { cursor, search: '', limit: 5 }).rows.map(
        r => r.id,
      ),
    ).toEqual([3, 1]);
    expect(
      pageOf(rows, 'file_name', {
        cursor: null,
        search: 'PODCAST',
        limit: 5,
      }).rows.map(r => r.id),
    ).toEqual([2, 3]);
  });

  const toItem = (row: Record<string, unknown>) =>
    row.url
      ? {
          title: String(row.file_name ?? ''),
          voiceName: null,
          durationSeconds: 0,
          audioUrl: String(row.url),
          metadata: {},
        }
      : null;

  it('turns rows into files and skips rows without audio', () => {
    const files = toFetched(
      'audioClean',
      [...rows, { id: 4, url: '', created_at: '2026-10-04T00:00:00Z' }],
      toItem,
    );
    expect(files.map(f => f.item.id)).toEqual([
      'audioClean:1',
      'audioClean:2',
      'audioClean:3',
    ]);
    expect(files[0].item.fileUrl).toBe('u1');
    // A row without a name gets the file's name.
    const unnamed = toFetched(
      'voiceChanger',
      [
        {
          id: 7,
          url: 'https://x/conversion/conv_7.mp3',
          created_at: '2026-10-04T00:00:00Z',
        },
      ],
      toItem,
    );
    expect(unnamed[0].item.title).toBe('conv_7');
  });

  it('merges sources newest first and pages without repeats', () => {
    const a = toFetched('audioClean', rows, toItem);
    const b = toFetched(
      'voiceChanger',
      [
        {
          id: 9,
          file_name: 'X',
          url: 'u9',
          created_at: '2026-10-02T12:00:00.000Z',
        },
      ],
      toItem,
    );
    const first = mergePage(
      [
        { rows: a, full: false },
        { rows: b, full: false },
      ],
      null,
      2,
    );
    expect(first.items.map(i => i.id)).toEqual([
      'audioClean:2',
      'voiceChanger:9',
    ]);
    expect(first.nextCursor).toEqual({
      createdAt: '2026-10-02T12:00:00.000Z',
      seen: ['voiceChanger:9'],
    });

    // The next page: each source returns only rows at or before the cursor
    // time (as the database query does), and what was shown is skipped.
    const cursorTime = Date.parse(first.nextCursor!.createdAt);
    const upTo = (list: typeof a) =>
      list.filter(f => f.item.createdAt.getTime() <= cursorTime);
    const second = mergePage(
      [
        { rows: upTo(a), full: false },
        { rows: upTo(b), full: false },
      ],
      first.nextCursor,
      2,
    );
    expect(second.items.map(i => i.id)).toEqual([
      'audioClean:3',
      'audioClean:1',
    ]);
    expect(second.nextCursor).toBeNull();
  });
});
