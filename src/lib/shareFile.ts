import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { AppError } from '@/lib/errors';

// Share a downloaded file, keeping the server-provided filename and format.
// A separate folder prevents concurrent downloads from overwriting each other.
export async function shareRemoteFile(url: string) {
  if (!(await isAvailableAsync())) {
    throw new AppError('shareUnavailable');
  }
  const directory = new Directory(Paths.cache, `audio-share-${randomUUID()}`);
  directory.create();
  try {
    const file = await File.downloadFileAsync(url, directory);
    await shareAsync(file.uri, { dialogTitle: file.name });
  } finally {
    // shareAsync resolves when the native share sheet is dismissed.
    try {
      directory.delete();
    } catch {
      // The OS can reclaim the cache if a recipient still holds the file open.
    }
  }
}

// Writes text to a temporary file and opens the system share sheet
// (save to Files, AirDrop, email...). The file lives in the cache folder,
// which the OS clears when it needs space.
export async function shareTextFile(
  fileName: string,
  content: string,
  mimeType: string,
) {
  if (!(await isAvailableAsync())) {
    throw new AppError('shareUnavailable');
  }
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(content);
  await shareAsync(file.uri, { mimeType, dialogTitle: fileName });
}
