import { config } from '@/config';
import type { AudioSample } from '@/domain';
import { AppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export type UploadTask = {
  promise: Promise<void>;
  abort: () => void;
};

type Options = {
  bucket: string;
  path: string;
  file: AudioSample;
  // 0 to 1, called as bytes are sent.
  onProgress?: (ratio: number) => void;
};

// Uploads a local file to Supabase Storage. The file is streamed from disk
// by the native networking layer (multipart FormData with a file uri), so
// even a 50 MB video never sits in the JS heap; XHR is used because it
// reports upload progress, which fetch does not.
export function uploadFile({ bucket, path, file, onProgress }: Options): UploadTask {
  const xhr = new XMLHttpRequest();

  const promise = (async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new AppError('uploadFailed');
    }

    const form = new FormData();
    // React Native reads { uri, name, type } as a file part.
    form.append('', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);

    await new Promise<void>((resolve, reject) => {
      xhr.open('POST', `${config.supabase.url}/storage/v1/object/${bucket}/${path}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('apikey', config.supabase.anonKey);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = event => {
        if (event.lengthComputable && event.total > 0) {
          onProgress?.(event.loaded / event.total);
        }
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new AppError('uploadFailed', xhr.responseText));
      xhr.onerror = () => reject(new AppError('network'));
      xhr.onabort = () => reject(new AppError('uploadFailed', 'aborted'));
      xhr.send(form);
    });
    onProgress?.(1);
  })();

  return { promise, abort: () => xhr.abort() };
}

// Best effort: remove an uploaded file the user discarded.
export async function removeUploadedFile(bucket: string, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}
