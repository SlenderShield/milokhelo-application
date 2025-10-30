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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGetTeamById, useUpdateTeam } from '@/src/api/hooks';
import { useAuth } from '@/src/context/AuthContext';
import { Avatar } from '@/src/components/Avatar';
import { ImagePickerComponent } from '@/src/components/ImagePicker';

const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Cricket',
  'Badminton',
  'Table Tennis',
  'Hockey',
];

export default function EditTeamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // Fetch team data
  const { data: team, isLoading: teamLoading } = useGetTeamById(id);
  const updateTeam = useUpdateTeam();

  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    sport?: string;
  }>({});

  // Pre-populate form when team data loads
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setSport(team.sport || '');
      setBio(team.description || '');
      setLogoUri(team.avatar || null);
    }
  }, [team]);

  // Check if user is captain
  const isCaptain = team && user && team.captain === user.id;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }

    if (!sport) {
      newErrors.sport = 'Please select a sport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isCaptain) {
      Alert.alert('Permission Denied', 'Only the team captain can edit the team');
      return;
    }

    try {
      const teamData: any = {
        id,
        name: name.trim(),
        sport,
      };

      if (bio.trim()) {
        teamData.description = bio.trim();
      }

      if (logoUri && logoUri !== team?.avatar) {
        // TODO: Upload image to backend and get URL
        teamData.avatar = logoUri;
      }

      await updateTeam.mutateAsync(teamData);

      Alert.alert('Success', 'Team updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update team');
    }
  };

  if (teamLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading team data...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isCaptain) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔒</Text>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>
          Only the team captain can edit this team
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {/* Team Logo */}
        <View style={styles.avatarContainer}>
          <ImagePickerComponent
            onImageSelected={(uri, size) => {
              setLogoUri(uri);
              Alert.alert('Success', `Team logo selected (${(size / 1024).toFixed(0)}KB)`);
            }}
            onError={(error) => {
              Alert.alert('Error', error.message);
            }}
            compressionOptions={{
              maxWidth: 500,
              maxHeight: 500,
              quality: 0.8,
              maxSizeInMB: 2,
            }}
            disabled={updateTeam.isPending}
          >
            <View style={styles.avatarWrapper}>
              <Avatar
                uri={logoUri}
                name={name}
                size={100}
                borderWidth={3}
                borderColor="#6200ee"
              />
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>📷</Text>
              </View>
            </View>
          </ImagePickerComponent>
          <Text style={styles.avatarHint}>Tap to change team logo</Text>
        </View>

        {/* Team Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Team Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter team name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            maxLength={50}
            editable={!updateTeam.isPending}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : (
            <Text style={styles.hintText}>{name.length}/50</Text>
          )}
        </View>

        {/* Sport Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Sport <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.sportGrid}>
            {SPORTS.map((sportOption) => (
              <TouchableOpacity
                key={sportOption}
                style={[
                  styles.sportChip,
                  sport === sportOption && styles.sportChipSelected,
                  errors.sport && !sport && styles.sportChipError,
                ]}
                onPress={() => {
                  setSport(sportOption);
                  if (errors.sport) {
                    setErrors({ ...errors, sport: undefined });
                  }
                }}
                disabled={updateTeam.isPending}
              >
                <Text
                  style={[
                    styles.sportChipText,
                    sport === sportOption && styles.sportChipTextSelected,
                  ]}
                >
                  {sportOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.sport && <Text style={styles.errorText}>{errors.sport}</Text>}
        </View>

        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about your team..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={5}
            maxLength={500}
            textAlignVertical="top"
            editable={!updateTeam.isPending}
          />
          <Text style={styles.hintText}>{bio.length}/500</Text>
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="City or area"
            value={location}
            onChangeText={setLocation}
            maxLength={100}
            editable={!updateTeam.isPending}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            updateTeam.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={updateTeam.isPending}
        >
          {updateTeam.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Team</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={updateTeam.isPending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 40,
    color: '#666',
  },
  avatarHint: {
    fontSize: 12,
    color: '#999',
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
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  sportChipSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  sportChipError: {
    borderColor: '#F44336',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sportChipTextSelected: {
    color: '#fff',
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
