// Voice Design: describe a voice, get variations, keep one.

// One generated candidate voice, playable before it is saved.
export type VoiceVariation = {
  id: string;
  previewUrl: string | null;
  // The sample sentence the variation reads.
  text: string;
};

export type DesignVoiceInput = {
  name: string;
  language: string;
  description: string;
};
