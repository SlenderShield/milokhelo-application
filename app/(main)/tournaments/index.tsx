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
import { useGetTournaments } from '@/src/api/hooks';
import { TournamentsLoadingState, EmptyState, ErrorState } from '@/src/components/LoadingState';

export default function TournamentsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'knockout' | 'league'>('all');

  // Fetch tournaments with optional search and type filter
  const params: any = {};
  if (searchQuery) params.q = searchQuery;
  if (filterType !== 'all') params.type = filterType;

  const { data: tournaments, isLoading, error, refetch } = useGetTournaments(
    Object.keys(params).length > 0 ? params : undefined
  );

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#2196F3';
      case 'ongoing':
        return '#4CAF50';
      case 'completed':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'knockout' ? '🏆' : '📊';
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tournaments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'knockout' && styles.filterButtonActive]}
            onPress={() => setFilterType('knockout')}
          >
            <Text style={[styles.filterButtonText, filterType === 'knockout' && styles.filterButtonTextActive]}>
              🏆 Knockout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'league' && styles.filterButtonActive]}
            onPress={() => setFilterType('league')}
          >
            <Text style={[styles.filterButtonText, filterType === 'league' && styles.filterButtonTextActive]}>
              📊 League
            </Text>
          </TouchableOpacity>
        </View>
        <TournamentsLoadingState count={5} />
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
            placeholder="Search tournaments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <ErrorState
          title="Failed to load tournaments"
          message={error.message}
          onRetry={refetch}
        />
      </View>
    );
  }

  // Empty state
  if (!tournaments || tournaments.length === 0) {
    return (
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tournaments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'knockout' && styles.filterButtonActive]}
            onPress={() => setFilterType('knockout')}
          >
            <Text style={[styles.filterButtonText, filterType === 'knockout' && styles.filterButtonTextActive]}>
              🏆 Knockout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'league' && styles.filterButtonActive]}
            onPress={() => setFilterType('league')}
          >
            <Text style={[styles.filterButtonText, filterType === 'league' && styles.filterButtonTextActive]}>
              📊 League
            </Text>
          </TouchableOpacity>
        </View>

        <EmptyState
          icon="🏆"
          title={searchQuery ? 'No tournaments found' : 'No tournaments available'}
          message={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a tournament!'
          }
          action={
            !searchQuery
              ? {
                  label: 'Create Tournament',
                  onPress: () => router.push('/tournaments/create'),
                }
              : {
                  label: 'Clear Search',
                  onPress: () => setSearchQuery(''),
                }
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/tournaments/create')}
        >
          <Text style={styles.fabText}>+ Create Tournament</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tournaments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'knockout' && styles.filterButtonActive]}
          onPress={() => setFilterType('knockout')}
        >
          <Text style={[styles.filterButtonText, filterType === 'knockout' && styles.filterButtonTextActive]}>
            🏆 Knockout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'league' && styles.filterButtonActive]}
          onPress={() => setFilterType('league')}
        >
          <Text style={[styles.filterButtonText, filterType === 'league' && styles.filterButtonTextActive]}>
            📊 League
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tournaments List */}
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
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
            style={styles.tournamentCard}
            onPress={() => router.push(`/tournaments/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
                <View>
                  <Text style={styles.tournamentName}>{item.title}</Text>
                  <Text style={styles.tournamentSport}>{item.sport}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              {item.description && (
                <Text style={styles.tournamentDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Participants:</Text>
                  <Text style={styles.infoValue}>
                    {item.teams?.length || 0} / {item.maxTeams || '∞'}
                  </Text>
                </View>
              </View>

              {item.startDate && (
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Starts:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/tournaments/create')}
      >
        <Text style={styles.fabText}>+ Create Tournament</Text>
      </TouchableOpacity>
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
  },
  searchInput: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  tournamentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fafafa',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tournamentSport: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  tournamentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
