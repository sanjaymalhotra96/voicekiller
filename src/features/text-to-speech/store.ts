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
  // Campaign name; null = "default".
  campaignName: string | null;
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
  setCampaign: (campaignName: string | null) => void;
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
  campaignName: null,
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
      setCampaign: campaignName => set({ campaignName }),
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
      // v2: campaigns are names (v1 stored an id, which is dropped).
      // v3: voices come from the real catalog; an older voice is dropped.
      version: 3,
      migrate: (persisted, version) => {
        const draft = { ...(persisted as Record<string, unknown>) };
        delete draft.campaignId;
        if (version < 3) {
          draft.voice = null;
        }
        return { ...draft, campaignName: draft.campaignName ?? null } as SpeechDraft;
      },
      storage: createJSONStorage(() => storage),
      // Persist data only, never the action functions.
      partialize: ({
        title,
        script,
        campaignName,
        voice,
        emotion,
        settings,
        instruction,
        instructionText,
      }): SpeechDraft => ({
        title,
        script,
        campaignName,
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
