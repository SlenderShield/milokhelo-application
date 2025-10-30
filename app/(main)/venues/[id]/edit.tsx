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
import { useGetVenueById, useUpdateVenue, useAuth } from '@/src/api/hooks';

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

const AMENITIES = [
  'Parking',
  'Changing Rooms',
  'Showers',
  'Lighting',
  'Seating',
  'First Aid',
  'Water',
  'WiFi',
];

export default function EditVenueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  // Fetch venue data
  const { data: venue, isLoading: venueLoading } = useGetVenueById(parseInt(id));
  const updateVenue = useUpdateVenue(parseInt(id));

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [pricePerHour, setPricePerHour] = useState('');
  const [capacity, setCapacity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    sports?: string;
    pricePerHour?: string;
  }>({});

  // Pre-populate form when venue data loads
  useEffect(() => {
    if (venue) {
      setName(venue.name || '');
      setAddress(venue.address || '');
      setDescription(venue.description || '');
      setSelectedSports(venue.sports || []);
      setSelectedAmenities(venue.amenities || []);
      setPricePerHour(venue.pricePerHour?.toString() || '');
      setCapacity(venue.capacity?.toString() || '');
      setPhone(venue.contactPhone || '');
      setEmail(venue.contactEmail || '');
    }
  }, [venue]);

  // Check if user is owner
  const isOwner = venue && user && venue.ownerId === user.id;

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Venue name is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (selectedSports.length === 0) {
      newErrors.sports = 'Please select at least one sport';
    }

    if (!pricePerHour || parseFloat(pricePerHour) <= 0) {
      newErrors.pricePerHour = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isOwner) {
      Alert.alert('Permission Denied', 'Only the venue owner can edit this venue');
      return;
    }

    try {
      const venueData: any = {
        name: name.trim(),
        address: address.trim(),
        sports: selectedSports,
        pricePerHour: parseFloat(pricePerHour),
      };

      if (description.trim()) {
        venueData.description = description.trim();
      }

      if (selectedAmenities.length > 0) {
        venueData.amenities = selectedAmenities;
      }

      if (capacity) {
        venueData.capacity = parseInt(capacity);
      }

      if (phone.trim()) {
        venueData.contactPhone = phone.trim();
      }

      if (email.trim()) {
        venueData.contactEmail = email.trim();
      }

      await updateVenue.mutateAsync(venueData);

      Alert.alert('Success', 'Venue updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update venue');
    }
  };

  if (venueLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading venue data...</Text>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Venue not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🔒</Text>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>
          Only the venue owner can edit this venue
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
        {/* Venue Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Venue Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Enter venue name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            maxLength={100}
            editable={!updateVenue.isPending}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.address ? styles.inputError : null]}
            placeholder="Full address"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) {
                setErrors({ ...errors, address: undefined });
              }
            }}
            maxLength={200}
            editable={!updateVenue.isPending}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your venue..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            editable={!updateVenue.isPending}
          />
          <Text style={styles.hintText}>{description.length}/500</Text>
        </View>

        {/* Sports */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Sports Available <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipGrid}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.chip,
                  selectedSports.includes(sport) && styles.chipSelected,
                ]}
                onPress={() => toggleSport(sport)}
                disabled={updateVenue.isPending}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSports.includes(sport) && styles.chipTextSelected,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.sports && <Text style={styles.errorText}>{errors.sports}</Text>}
        </View>

        {/* Amenities */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amenities (Optional)</Text>
          <View style={styles.chipGrid}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.chip,
                  selectedAmenities.includes(amenity) && styles.chipSelected,
                ]}
                onPress={() => toggleAmenity(amenity)}
                disabled={updateVenue.isPending}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedAmenities.includes(amenity) && styles.chipTextSelected,
                  ]}
                >
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Per Hour */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Price Per Hour ($) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.pricePerHour ? styles.inputError : null]}
            placeholder="e.g., 25.00"
            value={pricePerHour}
            onChangeText={(text) => {
              setPricePerHour(text.replace(/[^0-9.]/g, ''));
              if (errors.pricePerHour) {
                setErrors({ ...errors, pricePerHour: undefined });
              }
            }}
            keyboardType="decimal-pad"
            editable={!updateVenue.isPending}
          />
          {errors.pricePerHour && (
            <Text style={styles.errorText}>{errors.pricePerHour}</Text>
          )}
        </View>

        {/* Capacity */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Capacity (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Maximum number of people"
            value={capacity}
            onChangeText={(text) => setCapacity(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            editable={!updateVenue.isPending}
          />
        </View>

        {/* Contact Phone */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 234 567 8900"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!updateVenue.isPending}
          />
        </View>

        {/* Contact Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="contact@venue.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!updateVenue.isPending}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            updateVenue.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={updateVenue.isPending}
        >
          {updateVenue.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Venue</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={updateVenue.isPending}
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
    height: 100,
    paddingTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextSelected: {
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
