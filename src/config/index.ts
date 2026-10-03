// App-wide settings. Environment values come from EXPO_PUBLIC_* variables
// in .env (not committed to git); everything else is tuned here, not in
// screens. .env needs:
//   EXPO_PUBLIC_SUPABASE_URL       Supabase > Project Settings > API
//   EXPO_PUBLIC_SUPABASE_ANON_KEY  Supabase > Project Settings > API
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
  instructions: {
    // Library catalog rarely changes; refetch at most this often.
    staleTimeMs: 30 * 60_000,
  },
  clone: {
    // Recording stops by itself after this long.
    maxRecordSeconds: 120,
    // Private Supabase Storage bucket for voice samples.
    sampleBucket: 'voice-samples',
  },
  media: {
    // Private Supabase Storage bucket for tool inputs.
    sourceBucket: 'media-sources',
    // Cards shown under "Recent ..." on each tool screen.
    recentCount: 4,
  },
  // Supabase Edge Functions that talk to the speech/AI providers.
  // Request/response contracts are documented in each src/services file.
  functions: {
    createClone: 'voice-clone-create',
    designEnhance: 'voice-design-enhance',
    designGenerate: 'voice-design-generate',
    designSave: 'voice-design-save',
    changeVoice: 'voice-changer-convert',
    cleanAudio: 'audio-clean',
    editorTranscribe: 'speech-editor-transcribe',
    editorSynthesize: 'speech-editor-synthesize',
    editorSave: 'speech-editor-save',
    sttTranscribe: 'speech-to-text-transcribe',
    sttSave: 'speech-to-text-save',
    generateSpeech: 'tts-generate',
    previewSpeech: 'tts-preview',
    generateInstructions: 'acting-instructions-generate',
  },
  animation: {
    sheetMs: 260,
  },
} as const;
