import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { Playable, usePlayback } from '@/hooks/usePlayback';

type Status = { playing: boolean; didJustFinish?: boolean };
let mockOnStatus: (status: Status) => void = () => {};

const mockPlayer = {
  playing: false,
  play: jest.fn(() => {
    mockPlayer.playing = true;
  }),
  pause: jest.fn(() => {
    mockPlayer.playing = false;
  }),
  replace: jest.fn(),
  addListener: (_event: string, listener: (status: Status) => void) => {
    mockOnStatus = listener;
    return { remove: jest.fn() };
  },
};

jest.mock('expo-audio', () => ({ useAudioPlayer: () => mockPlayer }));

const item = (id: string): Playable => ({
  id,
  audioUrl: `https://example.com/${id}.mp3`,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPlayer.playing = false;
});

describe('usePlayback', () => {
  it('loads and plays a new item', async () => {
    const { result } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle(item('a')));

    expect(mockPlayer.replace).toHaveBeenCalledWith({
      uri: 'https://example.com/a.mp3',
    });
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(result.current.activeId).toBe('a');
  });

  it('pauses and resumes the active item', async () => {
    const { result } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle(item('a')));
    await act(() => result.current.toggle(item('a')));
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);

    await act(() => result.current.toggle(item('a')));
    expect(mockPlayer.play).toHaveBeenCalledTimes(2);
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1);
  });

  it('keeps toggle and stop stable while the active item changes', async () => {
    const { result } = await renderHook(() => usePlayback());
    const { toggle, stop } = result.current;

    await act(() => result.current.toggle(item('a')));
    await act(() => result.current.toggle(item('b')));

    expect(result.current.activeId).toBe('b');
    expect(result.current.toggle).toBe(toggle);
    expect(result.current.stop).toBe(stop);
  });

  it('mirrors player status and clears the item when it finishes', async () => {
    const { result } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle(item('a')));

    await act(() => mockOnStatus({ playing: true }));
    expect(result.current.playing).toBe(true);

    await act(() => mockOnStatus({ playing: false, didJustFinish: true }));
    expect(result.current).toMatchObject({ playing: false, activeId: null });
  });

  it('ignores items without audio', async () => {
    const { result } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle({ id: 'x', audioUrl: null }));
    expect(mockPlayer.replace).not.toHaveBeenCalled();
    expect(result.current.activeId).toBeNull();
  });

  it('stop pauses and clears the active item', async () => {
    const { result } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle(item('a')));
    await act(() => result.current.stop());

    expect(mockPlayer.pause).toHaveBeenCalled();
    expect(result.current.activeId).toBeNull();
  });

  it('survives a player that native code already released', async () => {
    const { result, unmount } = await renderHook(() => usePlayback());
    await act(() => result.current.toggle(item('a')));
    mockPlayer.pause.mockImplementationOnce(() => {
      throw new Error('Cannot use shared object that was already released');
    });

    await act(() => result.current.stop());
    expect(result.current.activeId).toBeNull();
    await expect(act(() => unmount())).resolves.not.toThrow();
  });
});
