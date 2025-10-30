import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useGetVenues, useSearchVenues } from '@/src/api/hooks';
import { VenuesLoadingState, EmptyState, ErrorState } from '@/src/components/LoadingState';

export default function VenuesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState<string>('');

  // Use search hook if there's a query, otherwise use regular get venues
  const shouldSearch = searchQuery.trim().length > 0 || filterSport.length > 0;

  const searchParams: any = {};
  if (searchQuery) searchParams.q = searchQuery;
  if (filterSport) searchParams.sport = filterSport;

  const {
    data: venues,
    isLoading,
    error,
    refetch,
  } = shouldSearch ? useSearchVenues(searchParams) : useGetVenues();

  const sports = ['Football', 'Basketball', 'Tennis', 'Volleyball', 'Cricket'];

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/venues/map')}>
            <Text style={styles.mapButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, !filterSport && styles.filterChipActive]}
            onPress={() => setFilterSport('')}
          >
            <Text style={[styles.filterChipText, !filterSport && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {sports.map(sport => (
            <TouchableOpacity
              key={sport}
              style={[styles.filterChip, filterSport === sport && styles.filterChipActive]}
              onPress={() => setFilterSport(sport)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterSport === sport && styles.filterChipTextActive,
                ]}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <VenuesLoadingState count={5} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/venues/map')}>
            <Text style={styles.mapButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
        <ErrorState title="Failed to load venues" message={error.message} onRetry={refetch} />
      </View>
    );
  }

  // Empty state
  if (!venues || venues.length === 0) {
    return (
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Sport Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, !filterSport && styles.filterChipActive]}
            onPress={() => setFilterSport('')}
          >
            <Text style={[styles.filterChipText, !filterSport && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {sports.map(sport => (
            <TouchableOpacity
              key={sport}
              style={[styles.filterChip, filterSport === sport && styles.filterChipActive]}
              onPress={() => setFilterSport(sport)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterSport === sport && styles.filterChipTextActive,
                ]}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <EmptyState
          icon="🏟️"
          title={searchQuery || filterSport ? 'No venues found' : 'No venues available'}
          message={
            searchQuery || filterSport
              ? 'Try adjusting your search or filters'
              : 'Check back later for available venues'
          }
          action={
            searchQuery || filterSport
              ? {
                  label: 'Clear Filters',
                  onPress: () => {
                    setSearchQuery('');
                    setFilterSport('');
                  },
                }
              : undefined
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar with Map Button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/venues/map')}
          accessibilityLabel="View venues on map"
        >
          <Text style={styles.mapButtonText}>🗺️ Map</Text>
        </TouchableOpacity>
      </View>

      {/* Sport Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filterSport && styles.filterChipActive]}
          onPress={() => setFilterSport('')}
        >
          <Text style={[styles.filterChipText, !filterSport && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {sports.map(sport => (
          <TouchableOpacity
            key={sport}
            style={[styles.filterChip, filterSport === sport && styles.filterChipActive]}
            onPress={() => setFilterSport(sport)}
          >
            <Text
              style={[styles.filterChipText, filterSport === sport && styles.filterChipTextActive]}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Venues List */}
      <FlatList
        data={venues}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.venueCard}
            onPress={() => router.push(`/venues/${item.id}`)}
          >
            {/* Venue Image Placeholder */}
            <View style={styles.venueImage}>
              <Text style={styles.venueImageIcon}>🏟️</Text>
            </View>

            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{item.name}</Text>

              {item.address && (
                <View style={styles.addressRow}>
                  <Text style={styles.addressIcon}>📍</Text>
                  <Text style={styles.addressText} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              )}

              {item.sportsSupported && item.sportsSupported.length > 0 && (
                <View style={styles.sportsContainer}>
                  {item.sportsSupported.slice(0, 3).map((sport: string, index: number) => (
                    <View key={index} style={styles.sportTag}>
                      <Text style={styles.sportTagText}>{sport}</Text>
                    </View>
                  ))}
                  {item.sportsSupported.length > 3 && (
                    <Text style={styles.moreSports}>+{item.sportsSupported.length - 3}</Text>
                  )}
                </View>
              )}

              <View style={styles.venueFooter}>
                {item.priceRange && (
                  <Text style={styles.priceText}>
                    ${item.priceRange.min}-${item.priceRange.max}/hr
                  </Text>
                )}
                {item.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  mapButton: {
    height: 48,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  venueCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  venueImage: {
    width: 120,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueImageIcon: {
    fontSize: 48,
  },
  venueInfo: {
    flex: 1,
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  sportTag: {
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sportTagText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '600',
  },
  moreSports: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
