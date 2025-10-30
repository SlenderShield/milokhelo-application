import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  prepareImageForUpload,
  formatFileSize,
  type ImagePickerResult,
  type CompressionOptions,
} from '@/src/utils/imageUtils';

export interface ImagePickerComponentProps {
  onImageSelected: (uri: string, size: number) => void;
  onError?: (error: Error) => void;
  compressionOptions?: CompressionOptions & { maxSizeInMB?: number };
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Image Picker Component
 * Provides camera and gallery selection with automatic compression
 */
export function ImagePickerComponent({
  onImageSelected,
  onError,
  compressionOptions = {},
  children,
  disabled = false,
}: ImagePickerComponentProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleImagePick = async (source: 'camera' | 'gallery') => {
    try {
      setModalVisible(false);
      setProcessing(true);

      // Pick image from source
      const result: ImagePickerResult | null =
        source === 'camera'
          ? await pickImageFromCamera()
          : await pickImageFromGallery();

      if (!result) {
        setProcessing(false);
        return;
      }

      // Prepare image for upload (compress and validate)
      const { uri, size } = await prepareImageForUpload(
        result.uri,
        compressionOptions
      );

      setProcessing(false);
      onImageSelected(uri, size);
    } catch (error) {
      setProcessing(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process image';

      if (errorMessage.includes('permission')) {
        Alert.alert(
          'Permission Required',
          `Please grant ${source === 'camera' ? 'camera' : 'photo library'} permission in your device settings.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }

      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const openPicker = () => {
    if (disabled) return;
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={openPicker}
        disabled={disabled || processing}
        accessibilityLabel="Pick image"
      >
        {children || (
          <View style={styles.defaultButton}>
            <Text style={styles.defaultButtonText}>
              {processing ? 'Processing...' : 'Choose Image'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.processingText}>Processing image...</Text>
          </View>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Image Source</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleImagePick('camera')}
              accessibilityLabel="Take photo with camera"
            >
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleImagePick('gallery')}
              accessibilityLabel="Choose from gallery"
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionCancel]}
              onPress={() => setModalVisible(false)}
              accessibilityLabel="Cancel"
            >
              <Text style={styles.modalOptionTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  defaultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalOptionCancel: {
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
  },
  modalOptionTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    textAlign: 'center',
  },
});
