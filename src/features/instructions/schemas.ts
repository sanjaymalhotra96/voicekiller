import { z } from 'zod';
import { textLimits } from '@/domain';

// Error messages are i18n keys; form fields translate them.
export const newInstructionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'validation.titleRequired' })
    .max(textLimits.instructionName),
  prompt: z
    .string()
    .trim()
    .min(1, { error: 'validation.promptRequired' })
    .max(textLimits.instructionPrompt),
});

export type NewInstructionValues = z.infer<typeof newInstructionSchema>;
