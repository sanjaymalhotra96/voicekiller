import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { initialDraft, useSpeechDraft } from '@/features/text-to-speech/store';
import { resetUserScope } from '@/lib/userScope';

jest.mock('@/lib/storage', () => {
  const data = new Map<string, string>();
  return {
    secureStorage: {
      getString: (key: string) => data.get(key),
      set: (key: string, value: string) => data.set(key, value),
      remove: (key: string) => data.delete(key),
    },
  };
});

const state = () => useSpeechDraft.getState();

beforeEach(() => state().reset());

describe('useSpeechDraft', () => {
  it('starts from the initial draft', () => {
    expect(state()).toMatchObject(initialDraft);
  });

  it('merges settings patches', () => {
    state().updateSettings({ speed: 1.2 });
    state().updateSettings({ format: 'wav' });
    expect(state().settings).toEqual({
      format: 'wav',
      speed: 1.2,
      delivery: 'balanced',
    });
  });

  it('copies the instruction text when an instruction is picked', () => {
    state().selectInstruction(
      { id: 'i1', name: 'Calm', source: 'library' },
      'Read calmly',
    );
    expect(state().instruction?.name).toBe('Calm');
    expect(state().instructionText).toBe('Read calmly');
  });

  it('clearScript keeps the voice and settings', () => {
    state().setScript('Hello');
    state().setTitle('File');
    state().setEmotion('sad');
    state().clearScript();
    expect(state()).toMatchObject({ script: '', title: '', emotion: 'sad' });
  });

  it('is wiped when the signed-in user changes', () => {
    state().setScript('Private script');
    state().setCampaign('c1');
    resetUserScope();
    expect(state()).toMatchObject(initialDraft);
  });
});
