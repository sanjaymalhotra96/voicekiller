import type { LibraryItem, LibrarySource } from '@/domain';
import { apiRequest, studioOnly } from '@/lib/api';
import { asNumber, asText } from '@/utils';

// Where each tool keeps its Library files, and how a row becomes a file.
// The exact column types of these tables are not confirmed, so rows are
// read as plain records and every value is converted on the way in.

export type Row = Record<string, unknown>;

export type SourceTable = {
  table: string;
  // Column holding the owner's user id (denoise_results spells it `userid`).
  owner: string;
  // Column holding the file name (searched and renamed).
  title: string;
  // Deletes one file through the web API.
  remove: (item: Pick<LibraryItem, 'rowId' | 'fileUrl'>) => Promise<unknown>;
  // Reads the rows through the web API instead of the table (the whole
  // history, newest first). Paging and search are then done here.
  // `fresh`: a first page fetches again; later pages reuse that answer.
  list?: (userId: string, fresh: boolean) => Promise<Row[]>;
  // Row -> file, or null when the row has no audio yet (still processing).
  toItem: (row: Row) => RowFile | null;
};

// What a row says about its file; the rest comes from the table.
type RowFile = Omit<
  LibraryItem,
  'id' | 'rowId' | 'tool' | 'createdAt' | 'fileUrl'
> & { fileUrl?: string };

const text = asText;
const seconds = (value: unknown) => Math.max(0, asNumber(value));
const withAudio = <T extends { audioUrl: string }>(item: T) =>
  item.audioUrl ? item : null;

// GET /api/denoise/check-updates has no paging: it returns the whole
// history. It is downloaded on a Library visit's first page and the same
// answer is paged through for the rest of that visit.
let denoiseCache: { userId: string; rows: Promise<Row[]> } | null = null;

function denoiseHistory(userId: string, fresh: boolean): Promise<Row[]> {
  if (fresh || denoiseCache?.userId !== userId) {
    const rows = apiRequest<{ newResults?: Row[] }>(
      `/api/denoise/check-updates?userId=${encodeURIComponent(userId)}`,
    ).then(({ newResults }) => newResults ?? []);
    // A failed download is not kept: the next page tries again.
    rows.catch(() => {
      if (denoiseCache?.rows === rows) {
        denoiseCache = null;
      }
    });
    denoiseCache = { userId, rows };
  }
  return denoiseCache.rows;
}

export const sources: Record<LibrarySource, SourceTable> = {
  // AI Speech: Text to Speech output.
  textToSpeech: {
    table: 'generated_files',
    owner: 'user_id',
    title: 'file_name',
    // DELETE /api/tts/delete/:id -> { success: true }
    remove: item =>
      apiRequest(`/api/tts/delete/${encodeURIComponent(item.rowId)}`, {
        method: 'DELETE',
      }),
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: text(row.display_voice_name) || text(row.voice_name) || null,
        durationSeconds: seconds(row.duration),
        audioUrl: text(row.audio_path),
        metadata: {},
      }),
  },
  voiceChanger: {
    table: 'voice_conversion',
    owner: 'user_id',
    title: 'file_name',
    // DELETE /api/conversion/delete { id, mediaUrl }; 403 = Studio only.
    remove: item =>
      apiRequest('/api/conversion/delete', {
        method: 'DELETE',
        body: { id: item.rowId, mediaUrl: item.fileUrl },
        codes: studioOnly,
      }),
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.file_url),
        metadata: {},
      }),
  },
  audioClean: {
    table: 'denoise_results',
    owner: 'userid',
    title: 'file_name',
    // GET /api/denoise/check-updates?userId= -> { newResults: Row[] }
    list: (userId, fresh) => denoiseHistory(userId, fresh),
    // DELETE /api/denoise/delete { id, audioUrl }
    remove: item =>
      apiRequest('/api/denoise/delete', {
        method: 'DELETE',
        body: { id: item.rowId, audioUrl: item.fileUrl },
      }),
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.url),
        metadata: { enhanced: row.operation === 'denoised_enhanced' },
      }),
  },
  speechToText: {
    table: 'speech_text',
    owner: 'user_id',
    title: 'file_name',
    // DELETE /api/speech-to-text/delete { fileId, fileUrl }
    remove: item =>
      apiRequest('/api/speech-to-text/delete', {
        method: 'DELETE',
        body: { fileId: item.rowId, fileUrl: item.fileUrl },
      }),
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: seconds(row.duration),
        audioUrl: text(row.file_url),
        metadata: {},
      }),
  },
  // Plays the edited audio when there is one, otherwise the original.
  speechEditor: {
    table: 'transcription',
    owner: 'user_id',
    title: 'file_name',
    // DELETE /api/transcribe/delete { id, mediaUrl }; 403 = Studio only.
    remove: item =>
      apiRequest('/api/transcribe/delete', {
        method: 'DELETE',
        body: { id: item.rowId, mediaUrl: item.fileUrl },
        codes: studioOnly,
      }),
    toItem: row =>
      withAudio({
        title: text(row.file_name),
        voiceName: null,
        durationSeconds: 0,
        audioUrl: text(row.updated_speech) || text(row.media_url),
        fileUrl: text(row.media_url),
        metadata: {},
      }),
  },
};
