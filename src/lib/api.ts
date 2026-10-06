import { fetch as nativeFetch } from 'expo/fetch';
import { config } from '@/config';
import type { AudioSample } from '@/domain';
import { saveAudio } from '@/lib/audioCache';
import { AppError, AppErrorCode } from '@/lib/errors';
import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

// The Voice Killer web API. Every call sends the signed-in user's Supabase
// access token as a Bearer token, and every failure is an AppError: no
// connection, timeout, bad status, or API not configured.

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Per-endpoint meaning of a status, e.g. { 403: 'studioRequired' }.
type StatusCodes = Partial<Record<number, AppErrorCode>>;

// Endpoints that answer 403 when the plan is not Studio.
export const studioOnly: StatusCodes = { 403: 'studioRequired' };

// What a screen can pass to a long call: stop it when the screen closes
// (hooks/useUnmountSignal), and follow an upload.
export type JobControls = {
  signal?: AbortSignal;
  // 0 to 1, called as bytes are sent.
  onProgress?: (ratio: number) => void;
};

type Options = {
  method?: Method;
  // Sent as JSON.
  body?: Record<string, unknown>;
  codes?: StatusCodes;
  timeoutMs?: number;
  signal?: AbortSignal;
};

// The API often answers 400/403/500 with a message that says more than
// the status ("Voice Design is only available for Studio users").
function codeForMessage(message: string): AppErrorCode | null {
  if (/studio/i.test(message)) return 'studioRequired';
  if (/pro account required/i.test(message)) return 'studioRequired';
  if (/limit reached/i.test(message)) return 'quotaExceeded';
  if (/longer than 1000 characters/i.test(message)) return 'scriptTooLong';
  if (/free account|paid/i.test(message)) return 'paidPlanRequired';
  // Some endpoints answer 403 for a missing or expired token.
  if (/not authenticated|unauthorized|invalid token/i.test(message)) {
    return 'authRequired';
  }
  return null;
}

const messageOf = (json: unknown) => {
  const body = json as { error?: unknown; message?: unknown } | null;
  if (typeof body?.error === 'string') return body.error;
  if (typeof body?.message === 'string') return body.message;
  return '';
};

function errorFor(status: number, json: unknown, codes: StatusCodes = {}) {
  const fixed = codes[status];
  if (fixed) return new AppError(fixed, json);
  if (status === 401) return new AppError('authRequired', json);
  if (status === 404) return new AppError('notFound', json);
  if (status === 429) return new AppError('rateLimited', json);
  return new AppError(codeForMessage(messageOf(json)) ?? 'unknown', json);
}

// JSON when it is JSON; otherwise the text as { error } (e.g. SvelteKit's
// plain-text 403), so the log and message mapping still see it.
const parseJson = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { error: text };
  }
};

// The API (SvelteKit) rejects form uploads whose Origin is not its own
// ("Cross-site POST form submissions are forbidden"). Browsers send it;
// the app must send it itself, on every request to be safe.
const headersFor = (baseUrl: string, token: string) => ({
  Authorization: `Bearer ${token}`,
  Origin: baseUrl,
});

// Base URL and the current access token, or why there is none.
async function session() {
  const { baseUrl } = config.api;
  if (!baseUrl) {
    log('api', 'EXPO_PUBLIC_API_URL is not set in .env');
    throw new AppError('serviceUnavailable', 'EXPO_PUBLIC_API_URL missing');
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new AppError('authRequired');
  }
  return { baseUrl, token };
}

// fetch with the token, a JSON body and a timeout. Returns the response
// when it is OK; throws the matching AppError otherwise.
async function send(
  path: string,
  {
    method = 'GET',
    body,
    codes,
    timeoutMs = config.api.timeoutMs,
    signal,
  }: Options,
) {
  const { baseUrl, token } = await session();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);
  try {
    let response;
    try {
      // expo/fetch: native, and reads binary bodies (audio) directly.
      response = await nativeFetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...headersFor(baseUrl, token),
          ...(body ? { 'Content-Type': 'application/json' } : null),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) {
        throw new AppError('cancelled', error);
      }
      // No connection, DNS failure or timeout.
      throw new AppError('network', error);
    }
    if (!response.ok) {
      const json = parseJson(await response.text());
      log('api', `${method} ${path} -> ${response.status}`, json);
      throw errorFor(response.status, json, codes);
    }
    return response;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

// JSON request and response.
export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  const response = await send(path, options);
  return parseJson(await response.text()) as T;
}

// A request that answers with audio, saved for listening (lib/audioCache).
// Returns a uri a player can open.
export async function apiAudio(path: string, options: Options = {}): Promise<string> {
  const response = await send(path, { method: 'POST', ...options });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return saveAudio(bytes, 'mp3');
}

type UploadOptions = JobControls & {
  method?: Method;
  codes?: StatusCodes;
  timeoutMs?: number;
};

// multipart/form-data upload. Files are streamed from disk by the native
// networking layer, so a large video never sits in the JS heap; XHR is
// used because it reports upload progress, which fetch does not.
export async function apiUpload<T>(
  path: string,
  fields: Record<string, string | AudioSample>,
  {
    method = 'POST',
    codes,
    onProgress,
    signal,
    timeoutMs = config.api.uploadTimeoutMs,
  }: UploadOptions = {},
): Promise<T> {
  const { baseUrl, token } = await session();
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') {
      form.append(key, value);
    } else {
      // React Native reads { uri, name, type } as a file part.
      form.append(key, {
        uri: value.uri,
        name: value.name,
        type: value.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);
    }
  }

  const xhr = new XMLHttpRequest();
  const cancel = () => xhr.abort();
  signal?.addEventListener('abort', cancel);
  const { status, text } = await new Promise<{ status: number; text: string }>(
    (resolve, reject) => {
      xhr.open(method, `${baseUrl}${path}`);
      for (const [name, value] of Object.entries(headersFor(baseUrl, token))) {
        xhr.setRequestHeader(name, value);
      }
      xhr.timeout = timeoutMs;
      xhr.upload.onprogress = event => {
        if (event.lengthComputable && event.total > 0) {
          onProgress?.(event.loaded / event.total);
        }
      };
      xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
      xhr.onerror = () => reject(new AppError('network'));
      xhr.ontimeout = () => reject(new AppError('network', 'timeout'));
      xhr.onabort = () => reject(new AppError('cancelled'));
      xhr.send(form);
    },
  ).finally(() => signal?.removeEventListener('abort', cancel));

  const json = parseJson(text);
  if (status < 200 || status >= 300) {
    log('api', `${method} ${path} -> ${status}`, json);
    throw errorFor(status, json, codes);
  }
  onProgress?.(1);
  return json as T;
}
