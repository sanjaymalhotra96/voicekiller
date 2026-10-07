// Every text length limit in one place. They mirror database check
// constraints and provider limits, so change both together.
export const textLimits = {
  // Clone and design names (the API allows 100 for designs).
  voiceName: 80,
  // File names in Library (all tools).
  fileTitle: 200,
  // public.campaigns.name
  campaignName: 60,
  // public.custom_instructions.name
  instructionName: 60,
  // What a user may ask the AI to write instructions for.
  instructionPrompt: 2_000,
  // Voice Design description. The API allows 1000 characters including
  // the language and accent line it adds (~50), so a little is kept free.
  designDescription: 900,
  // Text to Speech script and Speech Editor transcription. Free plans
  // are limited to 1000 characters by the server (error: scriptTooLong).
  script: 50_000,
  // Onboarding demos: custom acting instructions and the line a preset
  // clone says.
  onboardingInstructions: 200,
  onboardingCloneScript: 200,
} as const;
