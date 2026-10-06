// App-wide settings. Environment values come from EXPO_PUBLIC_* variables
// in .env (not committed to git); everything else is tuned here, not in
// screens. .env needs:
//   EXPO_PUBLIC_SUPABASE_URL       Supabase > Project Settings > API
//   EXPO_PUBLIC_SUPABASE_ANON_KEY  Supabase > Project Settings > API
//   EXPO_PUBLIC_API_URL            Voice Killer web API base URL (no /api)
//   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY  RevenueCat > API keys (goog_...)
//   EXPO_PUBLIC_REVENUECAT_IOS_KEY      RevenueCat > API keys (appl_...)
//   EXPO_PUBLIC_PRIVACY_URL        Settings > Privacy Policy (optional)
//   EXPO_PUBLIC_SUPPORT_EMAIL      Settings > Contact Us (optional)
//   EXPO_PUBLIC_SHARE_URL          Settings > Share with friends (optional)

export const config = {
  // Language preselected in voice and transcription forms.
  defaultLanguage: 'en',
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  // Voice Killer web API (endpoints in services/*). Requests send the
  // Supabase access token as a Bearer token.
  api: {
    // Trailing slashes removed, so paths can start with "/api/...".
    baseUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, ''),
    timeoutMs: 30_000,
    // File uploads (Speech to Text accepts up to 1000 MB).
    uploadTimeoutMs: 30 * 60_000,
  },
  // RevenueCat (in-app subscriptions). Public SDK keys: safe in the app.
  // Empty key: purchases are off and Upgrade says so.
  purchases: {
    androidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
    iosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  },
  auth: {
    minPasswordLength: 8,
    // Must match Supabase: Authentication > Providers > Email > OTP length.
    otpLength: 6,
    otpResendSeconds: 60,
    // Deep link opened from the reset-password email.
    resetPasswordRedirect: 'voicekiller://reset-password',
  },
  library: {
    pageSize: 30,
    // All tab: files shown per date group (Today, Yesterday...).
    allTabPerGroup: 3,
    // Wait this long after typing before searching.
    searchDebounceMs: 300,
    // FlatList virtualisation: rows kept mounted around the viewport.
    list: {
      initialNumToRender: 12,
      maxToRenderPerBatch: 10,
      windowSize: 7,
    },
  },
  // Settings links, set in .env. Empty: Share sends a message without a
  // link; Contact Us and Privacy Policy do nothing.
  links: {
    privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
    appStore: process.env.EXPO_PUBLIC_SHARE_URL ?? '',
  },
  storage: {
    avatar: {
      // Supabase Storage bucket for profile photos.
      bucket: 'avatars',
      // Photos are downscaled to this square (px) before upload.
      size: 512,
      // JPEG quality 0-1.
      quality: 0.8,
    },
  },
  speech: {
    // Draft is saved to the device this long after the last edit.
    draftSaveDelayMs: 500,
  },
  voices: {
    pageSize: 30,
    searchDebounceMs: 300,
    list: {
      initialNumToRender: 10,
      maxToRenderPerBatch: 10,
      windowSize: 7,
    },
  },
  speechEditor: {
    // Recordings are cut to their first this-many seconds (the server
    // takes up to 2 minutes).
    maxSeconds: 120,
  },
  speechToText: {
    // Transcript lines kept mounted around the viewport.
    list: {
      initialNumToRender: 12,
      maxToRenderPerBatch: 10,
      windowSize: 7,
    },
  },
  instructions: {
    // Library catalog rarely changes; refetch at most this often.
    staleTimeMs: 30 * 60_000,
  },
  clone: {
    // Samples are cut to their first this-many seconds, and recording
    // stops by itself after this long.
    sampleSeconds: 30,
    // The API rejects samples shorter than this.
    minSampleSeconds: 1,
  },
  media: {
    // Cards shown under "Recent ..." on each tool screen.
    recentCount: 4,
    // Preview audio files kept on the device (lib/audioCache).
    previewFilesKept: 10,
  },
  // Supabase Edge Functions for features the web API does not cover.
  // Request/response contracts are documented in each src/services file.
  functions: {
    generateInstructions: 'acting-instructions-generate',
  },
  // How often running server jobs are checked, and when to give up.
  jobs: {
    speech: { intervalMs: 3000, timeoutMs: 10 * 60_000 },
    // V2 voice clone speech.
    cloneSpeech: { intervalMs: 4000, timeoutMs: 15 * 60_000 },
    conversion: { intervalMs: 4000, timeoutMs: 15 * 60_000 },
    inpaint: { intervalMs: 5000, timeoutMs: 5 * 60_000 },
    transcription: { intervalMs: 5000, timeoutMs: 60 * 60_000 },
  },
  animation: {
    sheetMs: 260,
  },
} as const;
