import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetMatches } from '@/src/api/hooks/useMatches';

export default function MatchesScreen() {
  const router = useRouter();
  const { data: matches, isLoading, error } = useGetMatches();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading matches</Text>
        <Text style={styles.errorSubtext}>{(error as Error).message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create Match</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {matches && matches.length > 0 ? (
          matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => router.push(`/(main)/matches/${match.id}`)}
            >
              <View style={styles.matchHeader}>
                <Text style={styles.matchTitle}>{match.title}</Text>
                <Text style={[styles.matchStatus, { color: getStatusColor(match.status) }]}>
                  {match.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.matchSport}>🏃 {match.sport}</Text>
              <Text style={styles.matchDate}>
                📅 {new Date(match.startAt).toLocaleDateString()}
              </Text>
              <Text style={styles.matchLocation}>
                📍 {match.location.city || match.location.address || 'Location TBD'}
              </Text>
              <Text style={styles.matchParticipants}>
                👥 {match.participants.length}/{match.maxParticipants || '∞'} participants
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptySubtext}>Create or search for matches to get started</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return '#2196F3';
    case 'live':
      return '#4CAF50';
    case 'finished':
      return '#9E9E9E';
    case 'cancelled':
      return '#F44336';
    default:
      return '#666';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  matchCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  matchStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchSport: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  matchLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  matchParticipants: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
