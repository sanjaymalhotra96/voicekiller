import type { LibraryFilter, VoiceQuery } from '@/domain';

// Every TanStack Query key in one place, so invalidation never misses.
export const queryKeys = {
  account: {
    all: ['account'] as const,
    profile: (userId: string | undefined) =>
      [...queryKeys.account.all, 'profile', userId] as const,
  },
  library: {
    all: ['library'] as const,
    list: (params: { filter: LibraryFilter; search: string }) =>
      [...queryKeys.library.all, 'list', params] as const,
  },
  voices: {
    all: ['voices'] as const,
    list: (params: VoiceQuery) =>
      [...queryKeys.voices.all, 'list', params] as const,
    mine: (source: 'cloned' | 'design') =>
      [...queryKeys.voices.all, 'mine', source] as const,
    favorites: () => [...queryKeys.voices.all, 'favorites'] as const,
  },
  instructions: {
    all: ['instructions'] as const,
    library: () => [...queryKeys.instructions.all, 'library'] as const,
    custom: () => [...queryKeys.instructions.all, 'custom'] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
  },
};
