import React, { ReactNode } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Checkbox } from '@/components/ui/Checkbox';
import { useFieldError } from '@/components/form/useFieldError';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  children: ReactNode;
};

// Checkbox bound to react-hook-form; shows the translated zod error.
export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  children,
}: Props<T>) {
  const fieldError = useFieldError();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldError(fieldState.error?.message);
        return (
          <View>
            <Checkbox
              checked={!!field.value}
              onChange={field.onChange}
              error={!!error}
            >
              {children}
            </Checkbox>
            {error ? (
              <AppText variant="caption" className="mt-1.5 text-danger">
                {error}
              </AppText>
            ) : null}
          </View>
        );
      }}
    />
  );
}
