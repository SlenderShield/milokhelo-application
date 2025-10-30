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
import { useGetTournamentById, useUpdateTournament } from '@/src/api/hooks';
import { useAuth } from '@/src/context/AuthContext';

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
  { value: 'knockout', label: 'Knockout', icon: '🏆', description: 'Single elimination bracket' },
  { value: 'league', label: 'League', icon: '📊', description: 'Round-robin format' },
];

export default function EditTournamentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // Fetch tournament data
  const { data: tournament, isLoading: tournamentLoading } = useGetTournamentById(id);
  const updateTournament = useUpdateTournament();

  const [name, setName] = useState('');
  const [type, setType] = useState<'knockout' | 'league' | 'mixed'>('knockout');
  const [sport, setSport] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    sport?: string;
    maxParticipants?: string;
    startDate?: string;
  }>({});

  // Pre-populate form when tournament data loads
  useEffect(() => {
    if (tournament) {
      setName(tournament.title || tournament.name || '');
      setType(tournament.type || 'knockout');
      setSport(tournament.sport || '');
      setDescription(tournament.description || '');
      setMaxParticipants(
        tournament.maxParticipants?.toString() || tournament.maxTeams?.toString() || ''
      );

      // Format dates if they exist
      if (tournament.startDate) {
        const start = new Date(tournament.startDate);
        setStartDate(start.toISOString().split('T')[0]);
      }
      if (tournament.endDate) {
        const end = new Date(tournament.endDate);
        setEndDate(end.toISOString().split('T')[0]);
      }

      // Tournament model doesn't have location field
      setLocation('');
    }
  }, [tournament]);

  // Check if user is organizer
  const isOrganizer = tournament && user && tournament.organizerId === user.id;

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

    if (maxParticipants && (parseInt(maxParticipants) < 2 || parseInt(maxParticipants) > 1000)) {
      newErrors.maxParticipants = 'Max participants must be between 2 and 1000';
    }

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        newErrors.startDate = 'Invalid date format (YYYY-MM-DD)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isOrganizer) {
      Alert.alert('Permission Denied', 'Only the tournament organizer can edit the tournament');
      return;
    }

    try {
      const tournamentData: any = {
        name: name.trim(),
        sport,
        type,
      };

      if (description.trim()) {
        tournamentData.description = description.trim();
      }

      if (maxParticipants) {
        tournamentData.maxParticipants = parseInt(maxParticipants);
      }

      if (startDate) {
        tournamentData.startDate = startDate;
      }

      if (endDate) {
        tournamentData.endDate = endDate;
      }

      if (location.trim()) {
        tournamentData.location = location.trim();
      }

      await updateTournament.mutateAsync(tournamentData);

      Alert.alert('Success', 'Tournament updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update tournament');
    }
  };

  if (tournamentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading tournament data...</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tournament not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isOrganizer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔒</Text>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>Only the tournament organizer can edit this tournament</Text>
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
            editable={!updateTournament.isPending}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : (
            <Text style={styles.hintText}>{name.length}/100</Text>
          )}
        </View>

        {/* Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Tournament Type <Text style={styles.required}>*</Text>
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
                disabled={updateTournament.isPending}
              >
                <Text style={styles.typeIcon}>{typeOption.icon}</Text>
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
                disabled={updateTournament.isPending}
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
            placeholder="Describe the tournament..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={1000}
            textAlignVertical="top"
            editable={!updateTournament.isPending}
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
              setMaxParticipants(text.replace(/[^0-9]/g, ''));
              if (errors.maxParticipants) {
                setErrors({ ...errors, maxParticipants: undefined });
              }
            }}
            keyboardType="number-pad"
            editable={!updateTournament.isPending}
          />
          {errors.maxParticipants ? (
            <Text style={styles.errorText}>{errors.maxParticipants}</Text>
          ) : (
            <Text style={styles.hintText}>Leave empty for unlimited</Text>
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
            editable={!updateTournament.isPending}
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
            editable={!updateTournament.isPending}
          />
          <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2025-11-20)</Text>
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
            editable={!updateTournament.isPending}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.submitButton, updateTournament.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={updateTournament.isPending}
        >
          {updateTournament.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Tournament</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={updateTournament.isPending}
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeCardSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5ff',
  },
  typeCardError: {
    borderColor: '#F44336',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: '#6200ee',
  },
  typeDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
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
