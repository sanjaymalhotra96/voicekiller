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

// One rule set per kind of upload. Tools reference these by name.
export const fileRules = {
  // Voice Clone sample: short and clean.
  clone: {
    extensions: ['mp3', 'wav', 'm4a', 'mp4', 'mov', 'webm', 'ogg'],
    mimeTypes: ['audio/*', 'video/mp4', 'video/quicktime', 'video/webm'],
    maxBytes: 4 * MB,
  },
  // Voice Changer source and target.
  changer: {
    extensions: ['mp3', 'wav'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav'],
    maxBytes: 50 * MB,
  },
  // Speech Editor, Audio Clean, Speech to Text.
  media: {
    extensions: [
      'mp3',
      'wav',
      'm4a',
      'aiff',
      'flac',
      'wma',
      'ogg',
      'mp4',
      'mov',
      'avi',
      'mkv',
      'webm',
    ],
    mimeTypes: ['audio/*', 'video/*'],
    maxBytes: 50 * MB,
  },
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

// ".mp3, .wav" for hints.
export const formatExtensions = (rules: FileRules) =>
  rules.extensions.map(ext => `.${ext}`).join(', ');

// Megabytes for "(Max 50MB)".
export const maxMegabytes = (rules: FileRules) => Math.round(rules.maxBytes / MB);
