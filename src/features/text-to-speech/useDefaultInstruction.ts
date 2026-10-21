import { useEffect, useState } from 'react';
import { isAutomaticInstruction } from '@/domain';
import { useActingInstructions } from '@/features/instructions/hooks';
import { useSpeechDraft } from '@/features/text-to-speech/store';

// Select the database's AI entry only when the hydrated draft has no directions.
export function useDefaultInstruction() {
  const needsDefault = useSpeechDraft(
    state => !state.instruction && !state.instructionText.trim(),
  );
  const [loaded, setLoaded] = useState(useSpeechDraft.persist.hasHydrated);
  useEffect(() => {
    const unsubscribe = useSpeechDraft.persist.onFinishHydration(() => setLoaded(true));
    setLoaded(useSpeechDraft.persist.hasHydrated());
    return unsubscribe;
  }, []);
  const library = useActingInstructions(loaded && needsDefault);

  useEffect(() => {
    if (!loaded || !needsDefault) return;
    const item = library.data?.find(isAutomaticInstruction);
    const draft = useSpeechDraft.getState();
    if (item && !draft.instruction && !draft.instructionText.trim()) {
      draft.selectInstruction(
        { id: item.id, name: item.name, source: 'library' },
        item.instructions,
      );
    }
  }, [loaded, needsDefault, library.data]);
}
