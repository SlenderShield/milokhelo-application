import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select date',
  error,
  required = false,
  minimumDate,
  maximumDate,
  mode = 'date',
}: FormDatePickerProps<T>) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (mode === 'time') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (mode === 'datetime') {
      return d.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return d.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : new Date();
          
          return (
            <>
              <TouchableOpacity
                style={[styles.dateButton, error && styles.dateButtonError]}
                onPress={() => setShow(true)}
              >
                <Text style={[
                  styles.dateText,
                  !value && styles.placeholder
                ]}>
                  {value ? formatDate(value) : placeholder}
                </Text>
                <Text style={styles.icon}>📅</Text>
              </TouchableOpacity>

              {show && (
                <DateTimePicker
                  value={dateValue}
                  mode={mode}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  onChange={(event, selectedDate) => {
                    setShow(Platform.OS === 'ios');
                    if (selectedDate) {
                      onChange(selectedDate.toISOString());
                    }
                  }}
                />
              )}
            </>
          );
        }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateButtonError: {
    borderColor: '#F44336',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  icon: {
    fontSize: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
