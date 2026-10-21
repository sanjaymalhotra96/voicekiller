import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';

// Remove the app's cached previews, downloaded audio, transcript exports,
// and profile images after account deletion. Exported copies in Files or
// another app belong to the user and are outside this cache.
export async function clearUserFiles() {
  for (const entry of new Directory(Paths.cache).list()) {
    if (
      entry.name === 'audio-previews' ||
      entry.name.startsWith('audio-share-') ||
      (entry instanceof File && /\.(srt|vtt|txt)$/i.test(entry.name))
    ) {
      entry.delete();
    }
  }
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
}
