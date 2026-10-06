import type { IconName } from '@/components';
import type { ToolId } from '@/domain';
import type { OwnVoiceSource } from '@/services/ownVoices';

// What every result card shows, whatever the tool produced.
export type ResultItem = {
  id: string;
  title: string;
  audioUrl: string | null;
  // Null when the API does not send one (clones, designs).
  createdAt: Date | null;
  // Small pill under the title ("English", "Enhanced").
  tag?: { label: string; icon?: IconName };
};

// Tools whose outputs have a "Recent ..." section and a "My ..." screen.
export type ResultTool = Extract<
  ToolId,
  | 'voiceClone'
  | 'voiceDesign'
  | 'voiceChanger'
  | 'audioClean'
  | 'speechEditor'
  | 'speechToText'
>;

// Where each tool's results live: the user's own voices, or Library files.
type ResultSource =
  | { kind: 'voices'; source: OwnVoiceSource }
  | { kind: 'library' };

export const resultSources: Record<ResultTool, ResultSource> = {
  voiceClone: { kind: 'voices', source: 'cloned' },
  voiceDesign: { kind: 'voices', source: 'design' },
  voiceChanger: { kind: 'library' },
  audioClean: { kind: 'library' },
  speechEditor: { kind: 'library' },
  speechToText: { kind: 'library' },
};

export const isResultTool = (value: string): value is ResultTool =>
  value in resultSources;

// Tools whose cards have no Download (clones and designs are voices, not
// files to keep).
export const undownloadableTools: readonly ResultTool[] = [
  'voiceClone',
  'voiceDesign',
];

// Tools whose cards have "View" (open the text) instead of "Rename".
export const viewableTools: readonly ResultTool[] = ['speechEditor', 'speechToText'];

// Tools whose cards have no Rename at all.
export const unrenamableTools: readonly ResultTool[] = ['voiceChanger'];

// Route of the full list ("View all").
export const resultsRoute = (tool: ResultTool) => `/results/${tool}` as const;
