import type { Voice } from '@/domain';
import { voiceDesignService } from '@/services/voiceDesign';
import { clonesService } from '@/services/voiceClone';

// Voices the user made: cloned (Voice Clone) and designed (Voice Design).
// The API lists and deletes them; it cannot rename them.

export type OwnVoiceSource = 'cloned' | 'design';

const services = { cloned: clonesService, design: voiceDesignService };

export const ownVoicesService = {
  list: (source: OwnVoiceSource): Promise<Voice[]> => services[source].listMine(),
  remove: (source: OwnVoiceSource, voice: Voice): Promise<void> =>
    services[source].remove(voice),
};
