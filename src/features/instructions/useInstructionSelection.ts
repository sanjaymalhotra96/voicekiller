import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import type { ActingInstruction, CustomInstruction } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech/store';

// Reads and sets the editor's acting instruction. Picking one copies its
// text into "Type your own instructions", then closes the picker.
export function useInstructionSelection() {
  const router = useRouter();
  const selected = useSpeechDraft(state => state.instruction);
  const selectInstruction = useSpeechDraft(state => state.selectInstruction);

  const selectLibrary = useCallback(
    (item: ActingInstruction) => {
      selectInstruction(
        { id: item.id, name: item.name, source: 'library' },
        item.instructions,
      );
      router.dismissTo('/text-to-speech');
    },
    [selectInstruction, router],
  );

  const selectCustom = useCallback(
    (item: CustomInstruction) => {
      selectInstruction(
        { id: item.id, name: item.name, source: 'custom' },
        item.instructions,
      );
      router.dismissTo('/text-to-speech');
    },
    [selectInstruction, router],
  );

  return {
    libraryId: selected?.source === 'library' ? selected.id : null,
    customId: selected?.source === 'custom' ? selected.id : null,
    selectLibrary,
    selectCustom,
  };
}
