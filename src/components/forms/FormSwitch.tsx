import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  error?: string;
}

export function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
  description,
  error,
}: FormSwitchProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Switch
              value={!!value}
              onValueChange={onChange}
              trackColor={{ false: '#ddd', true: '#b388ff' }}
              thumbColor={value ? '#6200ee' : '#f4f3f4'}
            />
          )}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
