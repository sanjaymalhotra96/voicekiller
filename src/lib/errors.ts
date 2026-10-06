import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  isAuthError,
  isAuthRetryableFetchError,
} from '@supabase/supabase-js';

// One error type the UI understands, whatever the source (Supabase, network).
export type AppErrorCode =
  | 'network'
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'emailTaken'
  | 'weakPassword'
  | 'otpInvalid'
  | 'rateLimited'
  | 'currentPasswordWrong'
  | 'uploadFailed'
  | 'quotaExceeded'
  | 'serviceUnavailable'
  | 'campaignExists'
  | 'fileType'
  | 'fileTooLarge'
  | 'micPermission'
  | 'shareUnavailable'
  | 'authRequired'
  | 'studioRequired'
  | 'notFound'
  | 'paidPlanRequired'
  | 'jobFailed'
  | 'jobTimeout'
  | 'sampleLength'
  | 'renameNotAllowed'
  | 'cancelled'
  | 'purchasesUnavailable'
  | 'purchaseFailed'
  | 'conversionFailed'
  | 'scriptTooLong'
  | 'unknown';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    // The original Supabase/network error, for logging.
    public readonly original?: unknown,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

const supabaseCodes: Record<string, AppErrorCode> = {
  invalid_credentials: 'invalidCredentials',
  email_not_confirmed: 'emailNotConfirmed',
  email_exists: 'emailTaken',
  user_already_exists: 'emailTaken',
  weak_password: 'weakPassword',
  otp_expired: 'otpInvalid',
  over_email_send_rate_limit: 'rateLimited',
  over_request_rate_limit: 'rateLimited',
};

// Edge Function HTTP status -> code. 402: out of minutes.
function functionsHttpCode(error: FunctionsHttpError): AppErrorCode {
  const status = (error.context as { status?: number } | undefined)?.status;
  if (status === 402) return 'quotaExceeded';
  if (status === 429) return 'rateLimited';
  if (status === 404 || (status !== undefined && status >= 500)) {
    return 'serviceUnavailable';
  }
  return 'unknown';
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof FunctionsFetchError) return new AppError('network', error);
  if (error instanceof FunctionsRelayError) {
    return new AppError('serviceUnavailable', error);
  }
  if (error instanceof FunctionsHttpError) {
    return new AppError(functionsHttpCode(error), error);
  }
  if (isAuthRetryableFetchError(error)) return new AppError('network', error);
  if (isAuthError(error)) {
    return new AppError(supabaseCodes[error.code ?? ''] ?? 'unknown', error);
  }
  if (error instanceof TypeError) return new AppError('network', error);
  // Supabase database errors are plain objects with a message.
  const message = (error as { message?: unknown } | null)?.message;
  if (typeof message === 'string' && /network|fetch/i.test(message)) {
    return new AppError('network', error);
  }
  return new AppError('unknown', error);
}

// i18n key for any thrown value: t(errorMessageKey(error)).
export const errorMessageKey = (error: unknown) =>
  `errors.${toAppError(error).code}` as const;
