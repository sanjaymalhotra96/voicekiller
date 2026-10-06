import type { ToolId } from '@/domain/tools';

// Tools whose results are files in Library. Each one is stored in its own
// table (see services/library.ts); these are also the Library filter chips.
export const librarySources = [
  'textToSpeech',
  'voiceChanger',
  'audioClean',
  'speechToText',
  'speechEditor',
] as const satisfies readonly ToolId[];
export type LibrarySource = (typeof librarySources)[number];

export const isLibrarySource = (value: string): value is LibrarySource =>
  (librarySources as readonly string[]).includes(value);

// One file in Library, whatever table it came from.
export type LibraryItem = {
  // `<source>:<row id>`: unique across tables (each has its own ids).
  id: string;
  // The row's id in its own table, for rename and delete.
  rowId: string;
  tool: LibrarySource;
  // Empty when the file has no name; the UI shows "Untitled".
  title: string;
  voiceName: string | null;
  // 0 when the table does not store a duration.
  durationSeconds: number;
  audioUrl: string;
  // The stored file the server deletes along with the record (for Speech
  // Editor the original upload, not the edited audio).
  fileUrl: string;
  createdAt: Date;
  metadata: LibraryItemMetadata;
};

// Tool-specific details.
type LibraryItemMetadata = {
  // Audio Clean: "Denoise & Enhance" was on.
  enhanced?: boolean;
  // Speech to Text: URL of the saved transcript JSON file.
  transcriptUrl?: string;
};

// Library list filter: one tool, or everything.
export type LibraryFilter = LibrarySource | 'all';

// Where the next page starts: the creation time of the last file shown
// (raw database value, microseconds kept) and the ids already shown at
// exactly that time, so rows sharing a timestamp are neither repeated nor
// skipped.
export type LibraryCursor = { createdAt: string; seen: string[] };
