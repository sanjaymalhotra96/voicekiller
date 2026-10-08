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
  | 'nothingToRestore'
  | 'conversionFailed'
  | 'scriptTooLong'
  | 'samePassword'
  | 'passwordNotSet'
  | 'googleSignInFailed'
  | 'appleSignInFailed'
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
  same_password: 'samePassword',
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
  if (error instanceof FunctionsFetchError)
    return new AppError('network', error);
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

// The API often answers 400/403/500 with a message that says more than
// the status ("Voice Design is only available for Studio users").
export function codeForMessage(message: string): AppErrorCode | null {
  if (/studio/i.test(message)) return 'studioRequired';
  if (/pro account required/i.test(message)) return 'studioRequired';
  // "Monthly limit reached", "Your account limit has been reached. Upgrade
  // to continue denoising".
  if (/limit (has been )?reached|upgrade to continue/i.test(message)) {
    return 'quotaExceeded';
  }
  if (/longer than 1000 characters/i.test(message)) return 'scriptTooLong';
  if (/free account|paid/i.test(message)) return 'paidPlanRequired';
  // Some endpoints answer 403 for a missing or expired token.
  if (/not authenticated|unauthorized|invalid token/i.test(message)) {
    return 'authRequired';
  }
  return null;
}
