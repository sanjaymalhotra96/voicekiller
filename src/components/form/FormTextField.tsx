import React, { forwardRef, Ref } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useFieldError } from '@/components/form/useFieldError';
import { TextField, TextFieldProps } from '@/components/ui/TextField';

type Props<T extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'error'
> & {
  control: Control<T>;
  name: FieldPath<T>;
  // Reformat input as the user types (e.g. insert slashes in dates).
  format?: (text: string) => string;
};

// TextField bound to react-hook-form; shows the translated zod error.
function FormTextFieldInner<T extends FieldValues>(
  { control, name, onBlur, format, ...rest }: Props<T>,
  ref: Ref<TextInput>,
) {
  const fieldError = useFieldError();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          ref={ref}
          value={field.value ?? ''}
          onChangeText={text => field.onChange(format ? format(text) : text)}
          onBlur={e => {
            field.onBlur();
            onBlur?.(e);
          }}
          error={fieldError(fieldState.error?.message)}
          {...rest}
        />
      )}
    />
  );
}

export const FormTextField = forwardRef(FormTextFieldInner) as <
  T extends FieldValues,
>(
  props: Props<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof FormTextFieldInner>;
