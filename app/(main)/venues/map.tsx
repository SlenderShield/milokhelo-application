import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import VenueMap from '@/src/components/VenueMap';
import {
  useLocation,
  formatDistance,
  calculateDistance,
  sortByDistance,
} from '@/src/hooks/useLocation';
import { useGetVenues } from '@/src/api/hooks/useVenues';
import type { Venue, GeoLocation } from '@/src/api/models/Venue';
import { useRouter } from 'expo-router';

/**
 * Helper to convert GeoJSON location to LocationCoords
 */
function geoLocationToCoords(geoLocation: GeoLocation) {
  const [lng, lat] = geoLocation.coordinates;
  return { latitude: lat, longitude: lng };
}

export default function VenuesMapScreen() {
  const router = useRouter();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [radiusFilter, setRadiusFilter] = useState<number>(50); // km

  // Get user location
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    refreshLocation,
  } = useLocation();

  // Get all venues
  const { data: venuesData, isLoading: venuesLoading, refetch } = useGetVenues();

  // Transform venues data for map (convert GeoLocation to LocationCoords)
  const venues = useMemo(() => {
    if (!venuesData) return [];

    return venuesData.map((venue: Venue) => ({
      ...venue,
      // Keep original location for API compatibility, add coords for convenience
      coords: venue.location ? geoLocationToCoords(venue.location) : null,
    }));
  }, [venuesData]);

  // Sort venues by distance if user location is available
  const sortedVenues = useMemo(() => {
    if (!userLocation) return venues;

    return [...venues]
      .filter(v => v.coords !== null)
      .map(venue => ({
        ...venue,
        distance: venue.coords ? calculateDistance(userLocation, venue.coords) : Infinity,
      }))
      .sort((a, b) => a.distance - b.distance)
      .filter(v => v.distance <= radiusFilter);
  }, [venues, userLocation, radiusFilter]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refreshLocation()]);
  };

  const handleVenuePress = (venue: Venue) => {
    router.push(`/venues/${venue.id}`);
  };

  const renderVenueListItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleVenuePress(item)}
      accessibilityLabel={`View ${item.name}`}
    >
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemAddress}>{item.address}</Text>
        <View style={styles.listItemMeta}>
          <Text style={styles.listItemSports}>{item.sportsSupported.join(' • ')}</Text>
          {typeof item.distance === 'number' && (
            <Text style={styles.listItemDistance}>📍 {formatDistance(item.distance)}</Text>
          )}
        </View>
      </View>
      <Text style={styles.listItemChevron}>›</Text>
    </TouchableOpacity>
  );

  if (venuesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading venues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Venues</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'map' && styles.viewToggleActive]}
            onPress={() => setViewMode('map')}
          >
            <Text
              style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}
            >
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text
              style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Status */}
      {locationLoading && (
        <View style={styles.locationStatus}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={styles.locationStatusText}>Getting your location...</Text>
        </View>
      )}
      {locationError && (
        <View style={[styles.locationStatus, styles.locationStatusError]}>
          <Text style={styles.locationStatusText}>📍 {locationError}</Text>
          <TouchableOpacity onPress={refreshLocation}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Radius Filter */}
      {userLocation && (
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Within:</Text>
          {[5, 10, 25, 50].map(radius => (
            <TouchableOpacity
              key={radius}
              style={[styles.filterChip, radiusFilter === radius && styles.filterChipActive]}
              onPress={() => setRadiusFilter(radius)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  radiusFilter === radius && styles.filterChipTextActive,
                ]}
              >
                {radius}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {viewMode === 'map' ? (
        <VenueMap
          venues={venues}
          userLocation={userLocation}
          selectedVenueId={selectedVenueId || undefined}
          onVenueSelect={venue => setSelectedVenueId(venue.id)}
          showUserLocation={true}
          height={600}
        />
      ) : (
        <FlatList
          data={sortedVenues}
          renderItem={renderVenueListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={venuesLoading}
              onRefresh={handleRefresh}
              colors={['#10b981']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {userLocation ? `No venues found within ${radiusFilter}km` : 'No venues available'}
              </Text>
              {!userLocation && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={refreshLocation}>
                  <Text style={styles.emptyStateButtonText}>Enable Location</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Stats Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Showing {sortedVenues.length} of {venues.length} venues
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  viewToggleActive: {
    backgroundColor: '#10b981',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewToggleTextActive: {
    color: 'white',
  },
  locationStatus: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationStatusError: {
    backgroundColor: '#fee2e2',
  },
  locationStatusText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  filterBar: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#10b981',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: 'white',
  },
  list: {
    padding: 20,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  listItemAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  listItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemSports: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  listItemDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  listItemChevron: {
    fontSize: 24,
    color: '#d1d5db',
    marginLeft: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
