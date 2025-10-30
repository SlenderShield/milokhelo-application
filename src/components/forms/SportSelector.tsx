import React from 'react';
import { FormMultiSelect, MultiSelectOption } from './FormMultiSelect';
import { Control, FieldValues, Path } from 'react-hook-form';

const SPORTS: MultiSelectOption[] = [
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Badminton', value: 'badminton' },
  { label: 'Table Tennis', value: 'table_tennis' },
  { label: 'Hockey', value: 'hockey' },
  { label: 'Rugby', value: 'rugby' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Softball', value: 'softball' },
  { label: 'Golf', value: 'golf' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Athletics', value: 'athletics' },
];

interface SportSelectorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function SportSelector<T extends FieldValues>({
  name,
  control,
  label = 'Sports',
  placeholder = 'Select sports',
  error,
  required = false,
}: SportSelectorProps<T>) {
  return (
    <FormMultiSelect
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      error={error}
      required={required}
      options={SPORTS}
    />
  );
}
