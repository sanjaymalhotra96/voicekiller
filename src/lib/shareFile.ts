import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { AppError } from '@/lib/errors';

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
