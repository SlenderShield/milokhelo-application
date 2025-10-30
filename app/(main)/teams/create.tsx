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
import { useCreateTeam } from '@/src/api/hooks';

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

export default function CreateTeamScreen() {
  const router = useRouter();
  const createTeam = useCreateTeam();

  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    sport?: string;
  }>({});

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

    try {
      const teamData: any = {
        name: name.trim(),
        sport,
      };

      if (bio.trim()) {
        teamData.bio = bio.trim();
      }

      if (location.trim()) {
        teamData.location = location.trim();
      }

      const team = await createTeam.mutateAsync(teamData);

      Alert.alert('Success', 'Team created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/teams/${team.id}`),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create team');
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
        {/* Avatar Placeholder */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👥</Text>
          </View>
          <Text style={styles.avatarHint}>Team avatar (coming soon)</Text>
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
            onChangeText={text => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            maxLength={50}
            editable={!createTeam.isPending}
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
            {SPORTS.map(sportOption => (
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
                disabled={createTeam.isPending}
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
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            editable={!createTeam.isPending}
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
            editable={!createTeam.isPending}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, createTeam.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createTeam.isPending}
        >
          {createTeam.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Team</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={createTeam.isPending}
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarIcon: {
    fontSize: 48,
  },
  avatarHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
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
