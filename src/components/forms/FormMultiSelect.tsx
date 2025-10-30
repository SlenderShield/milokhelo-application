import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface FormMultiSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  options: MultiSelectOption[];
}

export function FormMultiSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select options',
  error,
  required = false,
  options,
}: FormMultiSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

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
          const selectedValues = Array.isArray(value) ? value : [];
          const selectedLabels = options
            .filter(opt => selectedValues.includes(opt.value))
            .map(opt => opt.label);
          
          const toggleOption = (optionValue: string) => {
            const newValues = selectedValues.includes(optionValue)
              ? selectedValues.filter(v => v !== optionValue)
              : [...selectedValues, optionValue];
            onChange(newValues);
          };

          return (
            <>
              <TouchableOpacity
                style={[styles.select, error && styles.selectError]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[
                  styles.selectText,
                  selectedLabels.length === 0 && styles.placeholder
                ]}>
                  {selectedLabels.length > 0 
                    ? selectedLabels.join(', ')
                    : placeholder
                  }
                </Text>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>

              <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
              >
                <Pressable 
                  style={styles.modalOverlay}
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {label || 'Select'} ({selectedValues.length} selected)
                      </Text>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text style={styles.doneButton}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={options}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.option,
                            selectedValues.includes(item.value) && styles.selectedOption,
                          ]}
                          onPress={() => toggleOption(item.value)}
                        >
                          <Text style={[
                            styles.optionText,
                            selectedValues.includes(item.value) && styles.selectedOptionText,
                          ]}>
                            {item.label}
                          </Text>
                          <View style={[
                            styles.checkbox,
                            selectedValues.includes(item.value) && styles.checkboxChecked,
                          ]}>
                            {selectedValues.includes(item.value) && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </Pressable>
              </Modal>
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
  select: {
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
  selectError: {
    borderColor: '#F44336',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#f0f0ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
