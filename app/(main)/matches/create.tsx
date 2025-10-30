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
import { useCreateMatch, useGetTeams } from '@/src/api/hooks';

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

export default function CreateMatchScreen() {
  const router = useRouter();
  const createMatch = useCreateMatch();
  
  // Fetch user's teams for selection
  const { data: teams, isLoading: teamsLoading } = useGetTeams();

  const [sport, setSport] = useState('');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{
    sport?: string;
    opponent?: string;
    date?: string;
    time?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!sport) {
      newErrors.sport = 'Please select a sport';
    }

    if (!opponent.trim()) {
      newErrors.opponent = 'Opponent name is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const matchDate = new Date(date);
      if (isNaN(matchDate.getTime())) {
        newErrors.date = 'Invalid date format (YYYY-MM-DD)';
      }
    }

    if (!time) {
      newErrors.time = 'Time is required';
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        newErrors.time = 'Invalid time format (HH:MM)';
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
      const matchData: any = {
        sport,
        opponent: opponent.trim(),
        scheduledAt: `${date}T${time}:00.000Z`,
      };

      if (location.trim()) {
        matchData.location = location.trim();
      }

      if (notes.trim()) {
        matchData.notes = notes.trim();
      }

      const match = await createMatch.mutateAsync(matchData);
      
      Alert.alert('Success', 'Match created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/matches/${match.id}`),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create match');
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
        <Text style={styles.headerText}>Schedule a new match</Text>

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
                disabled={createMatch.isPending}
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

        {/* Opponent */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Opponent <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.opponent ? styles.inputError : null]}
            placeholder="Team or player name"
            value={opponent}
            onChangeText={(text) => {
              setOpponent(text);
              if (errors.opponent) {
                setErrors({ ...errors, opponent: undefined });
              }
            }}
            maxLength={100}
            editable={!createMatch.isPending}
          />
          {errors.opponent && (
            <Text style={styles.errorText}>{errors.opponent}</Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.date ? styles.inputError : null]}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={(text) => {
              setDate(text);
              if (errors.date) {
                setErrors({ ...errors, date: undefined });
              }
            }}
            maxLength={10}
            editable={!createMatch.isPending}
          />
          {errors.date ? (
            <Text style={styles.errorText}>{errors.date}</Text>
          ) : (
            <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2025-11-15)</Text>
          )}
        </View>

        {/* Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Time <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.time ? styles.inputError : null]}
            placeholder="HH:MM"
            value={time}
            onChangeText={(text) => {
              setTime(text);
              if (errors.time) {
                setErrors({ ...errors, time: undefined });
              }
            }}
            maxLength={5}
            editable={!createMatch.isPending}
          />
          {errors.time ? (
            <Text style={styles.errorText}>{errors.time}</Text>
          ) : (
            <Text style={styles.hintText}>Format: HH:MM (e.g., 14:30)</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Venue or address"
            value={location}
            onChangeText={setLocation}
            maxLength={200}
            editable={!createMatch.isPending}
          />
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional information..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            editable={!createMatch.isPending}
          />
          <Text style={styles.hintText}>{notes.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createMatch.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMatch.isPending}
        >
          {createMatch.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Match</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={createMatch.isPending}
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
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
