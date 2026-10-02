// Tool IDs, shared by the UI catalog (features/tools) and the API layer.
// Must match the check constraint on public.library_items.tool.
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

export const isToolId = (value: string): value is ToolId =>
  (toolIds as readonly string[]).includes(value);
