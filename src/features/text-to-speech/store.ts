import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { config } from '@/config';
import {
  defaultSpeechSettings,
  EmotionId,
  SelectedInstruction,
  SpeechSettings,
  Voice,
} from '@/domain';
import { createDebouncedStorage } from '@/lib/debouncedStorage';
import { secureStorage } from '@/lib/storage';
import { registerUserScope } from '@/lib/userScope';

// The Text to Speech draft: everything on the editor and its sheets.
// Kept outside React so components subscribe to just the fields they show
// (typing re-renders the script box, not the whole screen), and saved
// encrypted on the device so a long script survives an app restart.

export type SpeechDraft = {
  title: string;
  script: string;
  // null = "Default".
  campaignId: string | null;
  voice: Voice | null;
  emotion: EmotionId;
  settings: SpeechSettings;
  instruction: SelectedInstruction | null;
  // Editable acting instructions (pre-filled from `instruction`).
  instructionText: string;
};

type Actions = {
  setTitle: (title: string) => void;
  setScript: (script: string) => void;
  setCampaign: (campaignId: string | null) => void;
  setVoice: (voice: Voice) => void;
  setEmotion: (emotion: EmotionId) => void;
  updateSettings: (patch: Partial<SpeechSettings>) => void;
  selectInstruction: (instruction: SelectedInstruction, text: string) => void;
  setInstructionText: (text: string) => void;
  // After a successful Generate: new file, same voice and settings.
  clearScript: () => void;
  reset: () => void;
};

const initialDraft: SpeechDraft = {
  title: '',
  script: '',
  campaignId: null,
  voice: null,
  emotion: 'auto',
  settings: defaultSpeechSettings,
  instruction: null,
  instructionText: '',
};

const storage = createDebouncedStorage(
  secureStorage,
  config.speech.draftSaveDelayMs,
);

export const useSpeechDraft = create<SpeechDraft & Actions>()(
  persist(
    set => ({
      ...initialDraft,
      setTitle: title => set({ title }),
      setScript: script => set({ script }),
      setCampaign: campaignId => set({ campaignId }),
      setVoice: voice => set({ voice }),
      setEmotion: emotion => set({ emotion }),
      updateSettings: patch =>
        set(state => ({ settings: { ...state.settings, ...patch } })),
      selectInstruction: (instruction, text) =>
        set({ instruction, instructionText: text }),
      setInstructionText: instructionText => set({ instructionText }),
      clearScript: () => set({ title: '', script: '' }),
      reset: () => set(initialDraft),
    }),
    {
      name: 'speech-draft',
      version: 1,
      storage: createJSONStorage(() => storage),
      // Persist data only, never the action functions.
      partialize: ({
        title,
        script,
        campaignId,
        voice,
        emotion,
        settings,
        instruction,
        instructionText,
      }): SpeechDraft => ({
        title,
        script,
        campaignId,
        voice,
        emotion,
        settings,
        instruction,
        instructionText,
      }),
    },
  ),
);

// A different user must not inherit this draft.
registerUserScope(() => useSpeechDraft.getState().reset());
