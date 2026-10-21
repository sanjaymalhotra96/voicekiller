import { Platform } from 'react-native';
import Constants from 'expo-constants';

// App-wide settings. Unprefixed values come through app.config.js and
// expo-constants; EXPO_PUBLIC_* values are inlined by Expo. Either name
// works. Set them in EAS or a local .env (not committed).
//   SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL
//   SUPABASE_ANON_KEY / EXPO_PUBLIC_SUPABASE_ANON_KEY
//   EXPO_PUBLIC_API_URL            Voice Killer web API (no /api)
//   ONBOARDING_ACTING_KEY          onboarding acting demo
//   ONBOARDING_CLONE_KEY           onboarding clone demo
//   REVENUECAT_ANDROID_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
//   REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_IOS_KEY
//   META_CLIENT_TOKEN             Meta client token, never the App Secret
//   EXPO_PUBLIC_PRIVACY_URL
//   EXPO_PUBLIC_TERMS_URL

const extra: {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  REVENUECAT_ANDROID_KEY?: string;
  REVENUECAT_IOS_KEY?: string;
  ONBOARDING_ACTING_KEY?: string;
  ONBOARDING_CLONE_KEY?: string;
  META_CLIENT_TOKEN?: string;
  META_APP_ID?: string;
} = Constants.expoConfig?.extra ?? {};

export const config = {
  // Language preselected in voice and transcription forms.
  defaultLanguage: 'en',
  supabase: {
    url: extra.SUPABASE_URL ?? '',
    anonKey: extra.SUPABASE_ANON_KEY ?? '',
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
    androidKey: extra.REVENUECAT_ANDROID_KEY ?? '',
    iosKey: extra.REVENUECAT_IOS_KEY ?? '',
  },
  meta: {
    appId: extra.META_APP_ID ?? '',
    clientToken: extra.META_CLIENT_TOKEN ?? '',
  },
  auth: {
    minPasswordLength: 8,
    // Must match Supabase: Authentication > Providers > Email > OTP length.
    otpLength: 6,
    otpResendSeconds: 60,
    // Recovery email opens the app's reset screen. Also list this in Supabase:
    // Authentication > URL Configuration > Redirect URLs.
    resetPasswordRedirect: 'voicekiller://reset-password',
    // Google sign-in returns here. Must be listed in Supabase: Authentication
    // > URL Configuration > Redirect URLs.
    oauthRedirect: 'voicekiller://auth-callback',
  },
  library: {
    pageSize: 30,
    // Wait this long after typing before searching.
    searchDebounceMs: 300,
  },
  // Contact Us: the Chatwoot website widget (app/(app)/support.tsx). The
  // website token is public: it is in every page that shows the widget.
  support: {
    chatwoot: {
      baseUrl: 'https://app.chatwoot.com',
      websiteToken: 'YvFNYYDJXTdXEp6kcFtDcJS2',
    },
  },
  // Onboarding demos (POST /api/app-onboard/acting and /clone). Called
  // before sign-in, so they send these fixed keys rather than a user token.
  onboarding: {
    actingKey: extra.ONBOARDING_ACTING_KEY ?? '',
    cloneKey: extra.ONBOARDING_CLONE_KEY ?? '',
  },
  // Shared by Settings and the paywall. Store links work after publication.
  links: {
    privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
    terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
    appStore: Platform.select({
      ios: 'https://apps.apple.com/app/id6818937314',
      android: 'https://play.google.com/store/apps/details?id=com.voicekiller',
      default: '',
    }),
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
    // Onboarding step 1 → 2: primary circle grows from the Next button.
    revealMs: 520,
  },
} as const;
