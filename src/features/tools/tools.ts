import type { IconName } from '@/components';
import type { ToolId } from '@/domain';
import type { ToneName } from '@/theme';

export type { ToolId } from '@/domain';

// Icon and tone per tool. Dashboard cards, Library filters and Library
// tags all read from here. Text lives in i18n under tools.<id>.
export const tools = {
  textToSpeech: { icon: 'toolTextToSpeech', tone: 'orange' },
  voiceClone: { icon: 'toolVoiceClone', tone: 'cyan' },
  voiceDesign: { icon: 'toolVoiceDesign', tone: 'purple' },
  voiceChanger: { icon: 'toolVoiceChanger', tone: 'red' },
  audioClean: { icon: 'toolAudioClean', tone: 'yellow' },
  speechEditor: { icon: 'toolSpeechEditor', tone: 'green' },
  speechToText: { icon: 'toolSpeechToText', tone: 'blue' },
} as const satisfies Record<ToolId, { icon: IconName; tone: ToneName }>;
