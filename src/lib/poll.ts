import { AppError } from '@/lib/errors';
import { log } from '@/lib/logger';

type Options = {
  intervalMs: number;
  // Gives up after this long with `jobTimeout`.
  timeoutMs: number;
  // Stops waiting (with `cancelled`), e.g. when the screen closes. The job
  // itself keeps running on the server.
  signal?: AbortSignal;
};

// Resolves after `ms`, or at once when `signal` aborts.
const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>(resolve => {
    const done = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal?.addEventListener('abort', done);
  });

// Calls `check` every `intervalMs` until it returns a value (the job is
// done) or throws (the job failed). `undefined` means "still running".
// The first check runs after one interval: a job is never done at once.
export async function pollJob<T>(
  check: () => Promise<T | undefined>,
  { intervalMs, timeoutMs, signal }: Options,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await wait(intervalMs, signal);
    if (signal?.aborted) {
      throw new AppError('cancelled');
    }
    let result: T | undefined;
    try {
      result = await check();
    } catch (error) {
      log('api', 'job failed', error instanceof AppError ? error.original : error);
      throw error;
    }
    if (result !== undefined) {
      return result;
    }
  }
  log('api', 'job timed out');
  throw new AppError('jobTimeout');
}
