import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  Button,
  FormError,
  FormTextField,
  ScreenHeader,
  TextArea,
  useFieldError,
} from '@/components';
import { textLimits } from '@/domain';
import {
  newInstructionSchema,
  NewInstructionValues,
  useGenerateInstruction,
  useInstructionSelection,
} from '@/features/instructions';

// Name + a short description; AI writes the full acting instructions,
// saves them to "My Instructions" and selects them for the script.
export function NewInstructionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const fieldError = useFieldError();
  const generate = useGenerateInstruction();
  const { selectCustom } = useInstructionSelection();
  const { control, handleSubmit } = useForm<NewInstructionValues>({
    resolver: zodResolver(newInstructionSchema),
    defaultValues: { name: '', prompt: '' },
  });

  const submit = handleSubmit(values =>
    generate.mutate(values, {
      onSuccess: created => {
        selectCustom(created);
        router.back();
      },
    }),
  );

  return (
    <View className="gap-5 pb-6 pt-2">
      <ScreenHeader title={t('instructions.create.title')} />

      <FormTextField
        control={control}
        name="name"
        tone="outline"
        required
        label={t('instructions.create.name')}
        placeholder={t('instructions.create.namePlaceholder')}
        maxLength={textLimits.instructionName}
        returnKeyType="next"
      />

      <View className="gap-2">
        <Controller
          control={control}
          name="prompt"
          render={({ field, fieldState }) => (
            <TextArea
              tone="outline"
              required
              label={t('instructions.create.prompt')}
              placeholder={t('instructions.create.promptPlaceholder')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={textLimits.instructionPrompt}
              error={fieldError(fieldState.error?.message)}
              boxClassName="h-textarea"
            />
          )}
        />
        <AppText variant="caption" className="text-ink-subtle">
          {t('instructions.create.hint')}
        </AppText>
      </View>

      <FormError error={generate.error} />

      <Button
        variant="ai"
        icon="sparkles"
        label={t('instructions.create.submit')}
        loading={generate.isPending}
        onPress={submit}
        className="mt-6"
      />
    </View>
  );
}
