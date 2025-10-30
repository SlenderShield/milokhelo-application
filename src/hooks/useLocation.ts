import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

/**
 * Custom hook to handle user's geolocation
 * Requests permissions and gets current location
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permissionGranted: false,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied',
          permissionGranted: false,
        }));
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        loading: false,
        error: null,
        permissionGranted: true,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
        permissionGranted: false,
      }));
    }
  };

  const refreshLocation = async () => {
    if (!state.permissionGranted) {
      await requestLocationPermission();
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh location',
      }));
    }
  };

  return {
    ...state,
    refreshLocation,
    requestLocationPermission,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: LocationCoords, coord2: LocationCoords): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
}

/**
 * Sort venues by distance from user location
 */
export function sortByDistance<T extends { location: LocationCoords }>(
  items: T[],
  userLocation: LocationCoords | null
): T[] {
  if (!userLocation) {
    return items;
  }

  return [...items].sort((a, b) => {
    const distanceA = calculateDistance(userLocation, a.location);
    const distanceB = calculateDistance(userLocation, b.location);
    return distanceA - distanceB;
  });
}

/**
 * Filter venues within a certain radius (in km)
 */
export function filterByRadius<T extends { location: LocationCoords }>(
  items: T[],
  userLocation: LocationCoords | null,
  radiusInKm: number
): T[] {
  if (!userLocation) {
    return items;
  }

  return items.filter(item => {
    const distance = calculateDistance(userLocation, item.location);
    return distance <= radiusInKm;
  });
}
