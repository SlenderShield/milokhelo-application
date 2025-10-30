import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: 'image';
  size?: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick an image from the camera
 */
export async function pickImageFromCamera(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: 'image',
    };
  } catch (error) {
    console.error('Error picking image from camera:', error);
    throw error;
  }
}

/**
 * Pick an image from the gallery
 */
export async function pickImageFromGallery(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: 'image',
    };
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    throw error;
  }
}

/**
 * Compress an image
 * Reduces file size while maintaining quality
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions = {}
): Promise<string> {
  try {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
    } = options;

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Generate a thumbnail from an image
 */
export async function generateThumbnail(
  uri: string,
  size: number = 200
): Promise<string> {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: size, height: size } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}

/**
 * Convert image to base64
 * Useful for uploading to backend
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Get image file size in bytes
 */
export async function getImageSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate image file size
 */
export async function validateImageSize(
  uri: string,
  maxSizeInMB: number = 5
): Promise<{ valid: boolean; size: number; message?: string }> {
  const size = await getImageSize(uri);
  const maxSize = maxSizeInMB * 1024 * 1024;
  
  if (size > maxSize) {
    return {
      valid: false,
      size,
      message: `Image size (${formatFileSize(size)}) exceeds maximum allowed size (${maxSizeInMB}MB)`,
    };
  }
  
  return { valid: true, size };
}

/**
 * Prepare image for upload
 * Compresses and validates the image
 */
export async function prepareImageForUpload(
  uri: string,
  options: CompressionOptions & { maxSizeInMB?: number } = {}
): Promise<{ uri: string; size: number }> {
  try {
    // Compress the image first
    const compressedUri = await compressImage(uri, options);
    
    // Validate size
    const validation = await validateImageSize(
      compressedUri,
      options.maxSizeInMB || 5
    );
    
    if (!validation.valid) {
      // If still too large, compress more aggressively
      const moreCompressed = await compressImage(uri, {
        ...options,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.6,
      });
      
      const revalidation = await validateImageSize(
        moreCompressed,
        options.maxSizeInMB || 5
      );
      
      if (!revalidation.valid) {
        throw new Error(revalidation.message);
      }
      
      return { uri: moreCompressed, size: revalidation.size };
    }
    
    return { uri: compressedUri, size: validation.size };
  } catch (error) {
    console.error('Error preparing image for upload:', error);
    throw error;
  }
}
