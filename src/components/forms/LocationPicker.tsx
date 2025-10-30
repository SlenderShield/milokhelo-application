import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import * as Location from 'expo-location';

interface LocationValue {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  required?: boolean;
}

export function LocationPicker<T extends FieldValues>({
  name,
  control,
  label = 'Location',
  error,
  required = false,
}: LocationPickerProps<T>) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressString = address
        ? `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`
        : 'Unknown address';

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addressString,
      };
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: LocationValue | null) => {
    if (!location) return 'Not selected';
    if (location.address) return location.address;
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

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
        render={({ field: { onChange, value } }) => (
          <View>
            <View style={[styles.locationDisplay, error && styles.locationDisplayError]}>
              <Text style={[styles.locationText, !value && styles.placeholder]}>
                {value ? formatLocation(value) : 'No location selected'}
              </Text>
              <Text style={styles.icon}>📍</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={async () => {
                  const location = await getCurrentLocation();
                  if (location) {
                    onChange(location);
                  }
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Getting location...' : '📍 Use Current Location'}
                </Text>
              </TouchableOpacity>

              {value && (
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={() => onChange(null)}
                >
                  <Text style={[styles.buttonText, styles.clearButtonText]}>✕ Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
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
  locationDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  locationDisplayError: {
    borderColor: '#F44336',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  icon: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flex: 0.4,
    backgroundColor: '#f5f5f5',
  },
  clearButtonText: {
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
