// Tool IDs, shared by the UI catalog (features/tools) and the API layer.
// Each tool has its own screen; tools that make files have their own
// table too (see domain/library.ts).
export const toolIds = [
  'textToSpeech',
  'voiceClone',
  'voiceDesign',
  'voiceChanger',
  'audioClean',
  'speechEditor',
  'speechToText',
] as const;

export type ToolId = (typeof toolIds)[number];
