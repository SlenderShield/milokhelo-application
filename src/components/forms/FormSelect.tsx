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

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select an option',
  error,
  required = false,
  options,
}: FormSelectProps<T>) {
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
          const selectedOption = options.find(opt => opt.value === value);
          
          return (
            <>
              <TouchableOpacity
                style={[styles.select, error && styles.selectError]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[
                  styles.selectText,
                  !selectedOption && styles.placeholder
                ]}>
                  {selectedOption?.label || placeholder}
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
                      <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={options}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.option,
                            value === item.value && styles.selectedOption,
                          ]}
                          onPress={() => {
                            onChange(item.value);
                            setModalVisible(false);
                          }}
                        >
                          <Text style={[
                            styles.optionText,
                            value === item.value && styles.selectedOptionText,
                          ]}>
                            {item.label}
                          </Text>
                          {value === item.value && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
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
  closeButton: {
    fontSize: 24,
    color: '#666',
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
  },
  selectedOptionText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#6200ee',
  },
});
