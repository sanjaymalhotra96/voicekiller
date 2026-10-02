// Which sheet the Text to Speech editor shows.
export type EditorSheet = 'voice' | 'emotion' | 'pause' | 'settings' | 'campaign';

// Common props of every editor sheet.
export type EditorSheetProps = {
  visible: boolean;
  onClose: () => void;
};
