import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useUpdateMyProfile } from '@/src/api/hooks';
import { Avatar } from '@/src/components/Avatar';
import { ImagePickerComponent } from '@/src/components/ImagePicker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const updateUser = useUpdateMyProfile();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [locationStr, setLocationStr] = useState(
    typeof user?.location === 'string' ? user.location : user?.location?.city || ''
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData: any = {
        name: name.trim(),
      };

      if (bio.trim()) {
        userData.bio = bio.trim();
      }

      if (locationStr.trim()) {
        userData.location = locationStr.trim();
      }

      if (avatarUri && avatarUri !== user?.avatar) {
        // TODO: Upload image to backend and get URL
        // For now, just include the local URI
        userData.avatar = avatarUri;
      }

      await updateUser.mutateAsync(userData);

      // Refresh user data in auth context
      refetch();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <ImagePickerComponent
            onImageSelected={(uri, size) => {
              setAvatarUri(uri);
              Alert.alert('Success', `Image selected (${(size / 1024).toFixed(0)}KB)`);
            }}
            onError={error => {
              Alert.alert('Error', error.message);
            }}
            compressionOptions={{
              maxWidth: 500,
              maxHeight: 500,
              quality: 0.8,
              maxSizeInMB: 2,
            }}
            disabled={updateUser.isPending || uploadingImage}
          >
            <View style={styles.avatarContainer}>
              <Avatar uri={avatarUri} name={user?.name} size={100} borderWidth={3} />
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>📷</Text>
              </View>
            </View>
          </ImagePickerComponent>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Email Display (Read-only) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{user?.email}</Text>
          </View>
          <Text style={styles.hintText}>Email cannot be changed</Text>
        </View>

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter your name"
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            maxLength={100}
            editable={!updateUser.isPending}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            editable={!updateUser.isPending}
          />
          <Text style={styles.hintText}>{bio.length}/500</Text>
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City or area"
            value={locationStr}
            onChangeText={setLocationStr}
            maxLength={100}
            editable={!updateUser.isPending}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.submitButton, updateUser.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={updateUser.isPending}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f5f5f5',
  },
  avatarBadgeText: {
    fontSize: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
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
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  readOnlyInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
});
