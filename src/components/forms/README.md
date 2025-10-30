# Form Components Library

A comprehensive collection of reusable form components for React Native with React Hook Form integration.

## Components

### FormInput
Text input field with label, placeholder, error handling, and multiline support.

```tsx
import { FormInput } from '@/src/components/forms';

<FormInput
  name="name"
  control={control}
  label="Name"
  placeholder="Enter your name"
  required
  error={errors.name?.message}
/>
```

### FormTextArea
Multi-line text input, built on top of FormInput.

```tsx
import { FormTextArea } from '@/src/components/forms';

<FormTextArea
  name="description"
  control={control}
  label="Description"
  placeholder="Enter description"
  numberOfLines={4}
  maxLength={500}
/>
```

### FormSelect
Single-select dropdown with modal picker.

```tsx
import { FormSelect } from '@/src/components/forms';

<FormSelect
  name="sport"
  control={control}
  label="Sport"
  placeholder="Select a sport"
  options={[
    { label: 'Football', value: 'football' },
    { label: 'Basketball', value: 'basketball' },
  ]}
  required
  error={errors.sport?.message}
/>
```

### FormMultiSelect
Multi-select dropdown with checkboxes.

```tsx
import { FormMultiSelect } from '@/src/components/forms';

<FormMultiSelect
  name="sports"
  control={control}
  label="Sports"
  placeholder="Select sports"
  options={[
    { label: 'Football', value: 'football' },
    { label: 'Basketball', value: 'basketball' },
  ]}
  required
  error={errors.sports?.message}
/>
```

### FormSwitch
Toggle switch with label and description.

```tsx
import { FormSwitch } from '@/src/components/forms';

<FormSwitch
  name="isPrivate"
  control={control}
  label="Private"
  description="Only invited members can join"
/>
```

### FormDatePicker
Date, time, or datetime picker using @react-native-community/datetimepicker.

```tsx
import { FormDatePicker } from '@/src/components/forms';

<FormDatePicker
  name="startDate"
  control={control}
  label="Start Date"
  placeholder="Select date"
  mode="date"
  minimumDate={new Date()}
  required
  error={errors.startDate?.message}
/>
```

### LocationPicker
Location picker with GPS and manual entry support.

```tsx
import { LocationPicker } from '@/src/components/forms';

<LocationPicker
  name="location"
  control={control}
  label="Location"
  required
  error={errors.location?.message}
/>
```

### SportSelector
Pre-configured multi-select for sports selection.

```tsx
import { SportSelector } from '@/src/components/forms';

<SportSelector
  name="sportsSupported"
  control={control}
  label="Supported Sports"
  required
  error={errors.sportsSupported?.message}
/>
```

## Usage Example

```tsx
import { useForm } from 'react-hook-form';
import { FormInput, FormSelect, SportSelector } from '@/src/components/forms';

interface FormData {
  name: string;
  sport: string;
  description: string;
  sportsSupported: string[];
}

export default function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <View>
      <FormInput
        name="name"
        control={control}
        label="Name"
        placeholder="Enter name"
        required
        error={errors.name?.message}
      />

      <FormSelect
        name="sport"
        control={control}
        label="Primary Sport"
        options={[
          { label: 'Football', value: 'football' },
          { label: 'Basketball', value: 'basketball' },
        ]}
        required
        error={errors.sport?.message}
      />

      <SportSelector
        name="sportsSupported"
        control={control}
        label="Supported Sports"
        required
        error={errors.sportsSupported?.message}
      />

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

## Features

- ✅ Full React Hook Form integration
- ✅ TypeScript support with generics
- ✅ Consistent styling across all components
- ✅ Error handling and validation display
- ✅ Required field indicators
- ✅ Accessible and user-friendly
- ✅ Native platform components
- ✅ Customizable and extensible

## Dependencies

- react-hook-form
- @react-native-community/datetimepicker
- expo-location

Make sure these are installed in your project.

## Styling

All components use a consistent design system with:
- Primary color: #6200ee
- Error color: #F44336
- Border radius: 8px
- Standard padding and margins

You can override styles by modifying the StyleSheet in each component file.
