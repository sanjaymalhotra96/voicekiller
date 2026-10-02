import {
  capabilitiesOf,
  defaultSpeechSettings,
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
    voiceId: draft.voice.id,
    emotion: can.emotions && draft.emotion !== 'auto' ? draft.emotion : null,
    settings: can.tuning
      ? draft.settings
      : { ...defaultSpeechSettings, format: draft.settings.format },
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
        campaignId: draft.campaignId,
      }
    : null;
}

// "We're a full-service UI/UX design agency that..." -> first words, as
// the Library title when the user left File name empty.
export function titleFromScript(script: string, maxLength = 40) {
  const clean = script.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
