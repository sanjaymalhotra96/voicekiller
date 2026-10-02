import { useCallback } from 'react';
import type { ActingInstruction, CustomInstruction } from '@/domain';
import { useSpeechDraft } from '@/features/text-to-speech';

// Reads and sets the editor's acting instruction. Picking one copies its
// text into "Type your own instructions", where the user can edit it.
export function useInstructionSelection() {
  const selected = useSpeechDraft(state => state.instruction);
  const selectInstruction = useSpeechDraft(state => state.selectInstruction);

  const selectLibrary = useCallback(
    (item: ActingInstruction) =>
      selectInstruction(
        { id: item.id, name: item.name, source: 'library' },
        item.instructions,
      ),
    [selectInstruction],
  );

  const selectCustom = useCallback(
    (item: CustomInstruction) =>
      selectInstruction(
        { id: item.id, name: item.name, source: 'custom' },
        item.instructions,
      ),
    [selectInstruction],
  );

  return {
    libraryId: selected?.source === 'library' ? selected.id : null,
    customId: selected?.source === 'custom' ? selected.id : null,
    selectLibrary,
    selectCustom,
  };
}
