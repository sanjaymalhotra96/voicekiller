// Every text length limit in one place. They mirror database check
// constraints and provider limits, so change both together.
export const textLimits = {
  // public.voices.name (clones, designs, renames).
  voiceName: 80,
  // public.library_items.title (Library files, tool results).
  fileTitle: 200,
  // public.campaigns.name
  campaignName: 60,
  // public.custom_instructions.name
  instructionName: 60,
  // What a user may ask the AI to write instructions for.
  instructionPrompt: 2_000,
  // Voice Design description.
  designDescription: 250,
  // Text to Speech script and Speech Editor transcription.
  script: 50_000,
} as const;
