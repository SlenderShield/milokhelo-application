import React from 'react';
import { FormInput } from './FormInput';
import { Control, FieldValues, Path } from 'react-hook-form';

interface FormTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

export function FormTextArea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  error,
  required = false,
  numberOfLines = 4,
  maxLength,
}: FormTextAreaProps<T>) {
  return (
    <FormInput
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      error={error}
      required={required}
      multiline={true}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
    />
  );
}
