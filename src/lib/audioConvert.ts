import { File } from 'expo-file-system';
import { cleanFiles, extractAudio, isValidFile, trim } from 'react-native-video-trim';
import { AudioSample, fileExtension, uploadAudioExtensions } from '@/domain';
import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';

// Turns any picked or recorded file into audio the servers take: mp3 and
// wav go up as they are; video, or audio in another format (m4a, ogg...),
// becomes mp3. Runs on the device with FFmpeg (react-native-video-trim,
// "audio" FFmpegKit build for the mp3 encoder; see
// plugins/withAudioConversion.js).

type Options = {
  // Keep only the first this-many seconds (Voice Clone).
  maxSeconds?: number;
  // Reject shorter clips with `sampleLength` (Voice Clone).
  minSeconds?: number;
};

// FFmpeg wants a plain path: "file:///a%20b.mp4" -> "/a b.mp4".
const toPath = (uri: string) => decodeURI(uri.replace(/^file:\/\//, ''));
const toUri = (path: string) => (path.startsWith('/') ? `file://${path}` : path);

const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'audio';

// Files made in earlier sessions are removed before the first conversion.
let cleaned = false;

export async function toUploadAudio(
  file: AudioSample,
  { maxSeconds, minSeconds }: Options = {},
): Promise<AudioSample> {
  const extension = fileExtension(file.name);
  const needsMp3 = !uploadAudioExtensions.includes(extension);
  if (!needsMp3 && !maxSeconds && !minSeconds) {
    return file;
  }

  try {
    if (!cleaned) {
      await cleanFiles();
      cleaned = true;
    }

    let path = toPath(file.uri);
    let outputExtension = extension;
    let durationMs: number;
    if (needsMp3) {
      const audio = await extractAudio(path, { outputExt: 'mp3' });
      path = audio.outputPath;
      outputExtension = 'mp3';
      durationMs = audio.duration;
    } else {
      durationMs = (await isValidFile(path)).duration;
    }

    if (minSeconds && durationMs < minSeconds * 1000) {
      throw new AppError('sampleLength');
    }
    if (maxSeconds && durationMs > maxSeconds * 1000) {
      // Stream copy (no re-encoding): fast and lossless.
      const cut = await trim(path, {
        type: 'audio',
        startTime: 0,
        endTime: maxSeconds * 1000,
        outputExt: outputExtension,
      });
      path = cut.outputPath;
    }

    if (path === toPath(file.uri)) {
      return file;
    }
    const uri = toUri(path);
    return {
      uri,
      name: `${baseName(file.name)}.${outputExtension}`,
      mimeType: outputExtension === 'wav' ? 'audio/wav' : 'audio/mpeg',
      size: new File(uri).size,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    log('api', 'audio conversion failed', error);
    throw new AppError('conversionFailed', error);
  }
}
