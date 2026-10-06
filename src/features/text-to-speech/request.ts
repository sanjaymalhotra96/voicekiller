import {
  capabilitiesOf,
  defaultCampaign,
  GenerateSpeechRequest,
  SpeechRequest,
} from '@/domain';
import type { SpeechDraft } from '@/features/text-to-speech/store';

// Builds what the server receives from the draft, sending only what the
// chosen voice's provider understands. Null when it can't be sent yet
// (no voice or an empty script).
export function toSpeechRequest(draft: SpeechDraft): SpeechRequest | null {
  const script = draft.script.trim();
  if (!draft.voice || !script) {
    return null;
  }
  const can = capabilitiesOf(draft.voice);
  const instructions = draft.instructionText.trim();

  return {
    script,
    voice: draft.voice,
    emotion: can.emotions && draft.emotion !== 'auto' ? draft.emotion : null,
    settings: draft.settings,
    instructions: can.actingInstructions && instructions ? instructions : null,
  };
}

export function toGenerateRequest(
  draft: SpeechDraft,
  fallbackTitle: string,
): GenerateSpeechRequest | null {
  const request = toSpeechRequest(draft);
  return request
    ? {
        ...request,
        title: draft.title.trim() || fallbackTitle,
        campaignName: draft.campaignName ?? defaultCampaign,
      }
    : null;
}

// File name when the user left it empty, like the web dashboard:
// "speech_1700000000" (seconds since 1970, so each one is unique).
export const defaultFileName = (now = Date.now()) =>
  `speech_${Math.floor(now / 1000)}`;
