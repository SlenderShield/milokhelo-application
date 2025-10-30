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
import { useCreateTournament } from '@/src/api/hooks';

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

const TOURNAMENT_TYPES = [
  { value: 'knockout', label: '🏆 Knockout', description: 'Single elimination bracket' },
  { value: 'league', label: '📊 League', description: 'Round-robin format' },
];

export default function CreateTournamentScreen() {
  const router = useRouter();
  const createTournament = useCreateTournament();

  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [type, setType] = useState<'knockout' | 'league' | ''>('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    sport?: string;
    type?: string;
    maxParticipants?: string;
    startDate?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Tournament name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Tournament name must be at least 3 characters';
    }

    if (!sport) {
      newErrors.sport = 'Please select a sport';
    }

    if (!type) {
      newErrors.type = 'Please select a tournament type';
    }

    if (maxParticipants) {
      const num = parseInt(maxParticipants, 10);
      if (isNaN(num) || num < 2) {
        newErrors.maxParticipants = 'Must be at least 2 participants';
      } else if (num > 1000) {
        newErrors.maxParticipants = 'Maximum 1000 participants';
      }
    }

    if (startDate) {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        newErrors.startDate = 'Invalid date format (YYYY-MM-DD)';
      } else if (date < new Date()) {
        newErrors.startDate = 'Start date must be in the future';
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
      const tournamentData: any = {
        name: name.trim(),
        sport,
        type: type as 'knockout' | 'league',
      };

      if (description.trim()) {
        tournamentData.description = description.trim();
      }

      if (maxParticipants) {
        tournamentData.maxParticipants = parseInt(maxParticipants, 10);
      }

      if (startDate) {
        tournamentData.startDate = new Date(startDate).toISOString();
      }

      if (endDate) {
        tournamentData.endDate = new Date(endDate).toISOString();
      }

      if (location.trim()) {
        tournamentData.location = location.trim();
      }

      const tournament = await createTournament.mutateAsync(tournamentData);

      Alert.alert('Success', 'Tournament created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/tournaments/${tournament.id}`),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create tournament');
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
        {/* Tournament Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Tournament Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter tournament name"
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            maxLength={100}
            editable={!createTournament.isPending}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : (
            <Text style={styles.hintText}>{name.length}/100</Text>
          )}
        </View>

        {/* Tournament Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeContainer}>
            {TOURNAMENT_TYPES.map(typeOption => (
              <TouchableOpacity
                key={typeOption.value}
                style={[
                  styles.typeCard,
                  type === typeOption.value && styles.typeCardSelected,
                  errors.type && !type && styles.typeCardError,
                ]}
                onPress={() => {
                  setType(typeOption.value as 'knockout' | 'league');
                  if (errors.type) {
                    setErrors({ ...errors, type: undefined });
                  }
                }}
                disabled={createTournament.isPending}
              >
                <Text
                  style={[styles.typeLabel, type === typeOption.value && styles.typeLabelSelected]}
                >
                  {typeOption.label}
                </Text>
                <Text
                  style={[
                    styles.typeDescription,
                    type === typeOption.value && styles.typeDescriptionSelected,
                  ]}
                >
                  {typeOption.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
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
                disabled={createTournament.isPending}
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

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your tournament..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
            textAlignVertical="top"
            editable={!createTournament.isPending}
          />
          <Text style={styles.hintText}>{description.length}/1000</Text>
        </View>

        {/* Max Participants */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Max Participants (Optional)</Text>
          <TextInput
            style={[styles.input, errors.maxParticipants ? styles.inputError : null]}
            placeholder="e.g., 16"
            value={maxParticipants}
            onChangeText={text => {
              setMaxParticipants(text);
              if (errors.maxParticipants) {
                setErrors({ ...errors, maxParticipants: undefined });
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            editable={!createTournament.isPending}
          />
          {errors.maxParticipants ? (
            <Text style={styles.errorText}>{errors.maxParticipants}</Text>
          ) : (
            <Text style={styles.hintText}>Leave empty for unlimited participants</Text>
          )}
        </View>

        {/* Start Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date (Optional)</Text>
          <TextInput
            style={[styles.input, errors.startDate ? styles.inputError : null]}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={text => {
              setStartDate(text);
              if (errors.startDate) {
                setErrors({ ...errors, startDate: undefined });
              }
            }}
            maxLength={10}
            editable={!createTournament.isPending}
          />
          {errors.startDate ? (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          ) : (
            <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2025-11-15)</Text>
          )}
        </View>

        {/* End Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
            maxLength={10}
            editable={!createTournament.isPending}
          />
          <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2025-11-30)</Text>
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="City or venue"
            value={location}
            onChangeText={setLocation}
            maxLength={200}
            editable={!createTournament.isPending}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, createTournament.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createTournament.isPending}
        >
          {createTournament.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Tournament</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={createTournament.isPending}
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
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  typeCardSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f0e6ff',
  },
  typeCardError: {
    borderColor: '#F44336',
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: '#6200ee',
  },
  typeDescription: {
    fontSize: 12,
    color: '#666',
  },
  typeDescriptionSelected: {
    color: '#6200ee',
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
