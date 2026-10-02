import type { ToolId } from '@/domain/tools';

// One generated audio file (row of public.library_items).
export type LibraryItem = {
  id: string;
  title: string;
  tool: ToolId;
  voiceName: string | null;
  durationSeconds: number;
  audioUrl: string;
  createdAt: Date;
  metadata: LibraryItemMetadata;
};

// Tool-specific details stored with a file (library_items.metadata).
export type LibraryItemMetadata = {
  // Audio Clean: "Denoise & Enhance" was on.
  enhanced?: boolean;
  // Speech to Text: spoken and subtitle languages.
  language?: string;
  translateTo?: string | null;
};

// Library list filter: one tool, or everything.
export type LibraryFilter = ToolId | 'all';

// Keyset cursor: the last row of a page. `createdAt` is the raw database
// timestamp (microseconds), not a JS Date, so no rows are skipped.
export type LibraryCursor = { createdAt: string; id: string };
