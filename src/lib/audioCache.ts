import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { config } from '@/config';

// Audio made only for listening (Text to Speech previews, Voice Design
// samples). Saved in its own cache folder, and only the newest few are
// kept, so previews never pile up on the device.

const folder = () => {
  const dir = new Directory(Paths.cache, 'audio-previews');
  if (!dir.exists) {
    dir.create({ idempotent: true });
  }
  return dir;
};

// Names start with a fixed-width timestamp, so they sort oldest first.
function prune(dir: Directory, keep: number) {
  const files = dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .sort((a, b) => (a.name < b.name ? 1 : -1));
  for (const old of files.slice(keep)) {
    try {
      old.delete();
    } catch {
      // Still open in a player: removed on a later save.
    }
  }
}

// Saves audio bytes (or base64 text) and returns a uri a player can open.
export function saveAudio(content: Uint8Array | string, extension: string) {
  const dir = folder();
  prune(dir, config.media.previewFilesKept - 1);
  const file = new File(dir, `${Date.now()}-${randomUUID()}.${extension}`);
  file.create({ overwrite: true });
  if (typeof content === 'string') {
    file.write(content, { encoding: 'base64' });
  } else {
    file.write(content);
  }
  return file.uri;
}
