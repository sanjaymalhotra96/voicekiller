// Local media files and the upload rules each tool enforces.

// A local audio/video file: picked from Files or just recorded.
export type AudioSample = {
  uri: string;
  name: string;
  mimeType: string | null;
  // Bytes, when the picker reports it.
  size: number | null;
};

export type FileRules = {
  // Lower-case extensions, shown to the user as ".mp3, .wav".
  extensions: readonly string[];
  // MIME types the system file picker is filtered to.
  mimeTypes: readonly string[];
  maxBytes: number;
};

const MB = 1024 * 1024;

// Every tool takes audio or video: a video, or audio in another format,
// is turned into mp3 on the device before upload (lib/audioConvert).
const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'flac', 'aiff', 'wma', 'amr'];
const videoExtensions = ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi', '3gp'];
const anyMedia = {
  extensions: [...audioExtensions, ...videoExtensions],
  mimeTypes: ['audio/*', 'video/*'],
};

// Formats uploaded as they are; anything else becomes mp3.
export const uploadAudioExtensions: readonly string[] = ['mp3', 'wav'];

// One rule set per kind of upload. Tools reference these by name.
// `maxBytes` is the API's upload limit, checked on the audio that is
// actually sent (after conversion and cutting), not on the picked file.
export const fileRules = {
  // Voice Clone: max 4 MB (api-voice-clone-design-stt.md). Cut to its
  // first config.clone.sampleSeconds.
  clone: { ...anyMedia, maxBytes: 4 * MB },
  // Voice Changer: no limit in the docs.
  changer: { ...anyMedia, maxBytes: 50 * MB },
  // Speech Editor: max 20 MB. Cut to its first
  // config.speechEditor.maxSeconds.
  editor: { ...anyMedia, maxBytes: 20 * MB },
  // Speech to Text: max 1000 MB. Full length, never cut.
  transcription: { ...anyMedia, maxBytes: 1000 * MB },
  // Audio Clean: 200 MB (not in the API docs yet).
  media: { ...anyMedia, maxBytes: 200 * MB },
} as const satisfies Record<string, FileRules>;

type FileError = 'fileType' | 'fileTooLarge';

export const fileExtension = (name: string) =>
  name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';

// Checks a file before uploading. Null when it is fine.
export function validateFile(
  file: Pick<AudioSample, 'name' | 'size'>,
  rules: FileRules,
): FileError | null {
  if (!rules.extensions.includes(fileExtension(file.name))) {
    return 'fileType';
  }
  if (file.size !== null && file.size > rules.maxBytes) {
    return 'fileTooLarge';
  }
  return null;
}

// Megabytes for "(Max 50MB)".
export const maxMegabytes = (rules: FileRules) => Math.round(rules.maxBytes / MB);
