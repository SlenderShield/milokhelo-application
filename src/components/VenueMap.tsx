import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { LocationCoords, calculateDistance, formatDistance } from '@/src/hooks/useLocation';
import type { Venue, GeoLocation } from '@/src/api/models/Venue';

/**
 * Convert GeoJSON Point format to LocationCoords
 * Backend uses [longitude, latitude] format, we need {latitude, longitude}
 */
function geoLocationToCoords(geoLocation: GeoLocation): LocationCoords {
  const [lng, lat] = geoLocation.coordinates;
  return {
    latitude: lat,
    longitude: lng,
  };
}

interface VenueMapProps {
  venues: Venue[];
  userLocation: LocationCoords | null;
  selectedVenueId?: string;
  onVenueSelect?: (venue: Venue) => void;
  showUserLocation?: boolean;
  height?: number;
}

/**
 * Map component to display venues with markers
 * Shows user location and allows venue selection
 */
export function VenueMap({
  venues,
  userLocation,
  selectedVenueId,
  onVenueSelect,
  showUserLocation = true,
  height = 400,
}: VenueMapProps) {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Default region (Johannesburg, South Africa if no user location)
  const defaultRegion: Region = {
    latitude: userLocation?.latitude || -26.2041,
    longitude: userLocation?.longitude || 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMarkerPress = (venue: Venue) => {
    setSelectedVenue(venue);
    if (onVenueSelect) {
      onVenueSelect(venue);
    }

    // Animate to marker
    if (mapRef.current && venue.location) {
      const coords = geoLocationToCoords(venue.location);
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleViewDetails = () => {
    if (selectedVenue) {
      router.push(`/venues/${selectedVenue.id}`);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const fitToMarkers = () => {
    if (mapRef.current && venues.length > 0) {
      const validVenues = venues.filter(v => v.location);
      if (validVenues.length > 0) {
        mapRef.current.fitToCoordinates(
          validVenues.map(v => geoLocationToCoords(v.location!)),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        onMapReady={fitToMarkers}
      >
        {/* Venue Markers */}
        {venues.map(venue => {
          if (!venue.location) return null;

          const isSelected = selectedVenueId === venue.id;
          const coords = geoLocationToCoords(venue.location);
          
          return (
            <Marker
              key={venue.id}
              coordinate={coords}
              title={venue.name}
              description={venue.address}
              onPress={() => handleMarkerPress(venue)}
              pinColor={isSelected ? '#10b981' : '#ef4444'}
            />
          );
        })}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {userLocation && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUser}
            accessibilityLabel="Center on my location"
          >
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
        )}
        
        {venues.length > 0 && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={fitToMarkers}
            accessibilityLabel="Show all venues"
          >
            <Text style={styles.controlButtonText}>🗺️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Venue Card */}
      {selectedVenue && (
        <View style={styles.venueCard}>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{selectedVenue.name}</Text>
            <Text style={styles.venueAddress}>{selectedVenue.address}</Text>
            {userLocation && selectedVenue.location && (
              <Text style={styles.venueDistance}>
                {formatDistance(calculateDistance(userLocation, geoLocationToCoords(selectedVenue.location)))} away
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleViewDetails}
            accessibilityLabel={`View details for ${selectedVenue.name}`}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator for no venues */}
      {venues.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No venues to display</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 24,
  },
  venueCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  venueDistance: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
