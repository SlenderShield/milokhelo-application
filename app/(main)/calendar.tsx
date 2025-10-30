import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useGetCalendarEvents } from '@/src/api/hooks';

type EventType = 'match' | 'tournament' | 'booking';

export default function CalendarScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: events, isLoading, error, refetch } = useGetCalendarEvents();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'match':
        return '⚽';
      case 'tournament':
        return '🏆';
      case 'booking':
        return '📅';
      default:
        return '📌';
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'match':
        return '#4CAF50';
      case 'tournament':
        return '#FF9800';
      case 'booking':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEventPress = (event: any) => {
    if (event.type === 'match' && event.matchId) {
      router.push(`/matches/${event.matchId}`);
    } else if (event.type === 'tournament' && event.tournamentId) {
      router.push(`/tournaments/${event.tournamentId}`);
    } else if (event.type === 'booking' && event.venueId) {
      router.push(`/venues/${event.venueId}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Failed to Load Events</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Upcoming Events</Text>
          <Text style={styles.emptyText}>
            Your matches, tournaments, and bookings will appear here
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc: any, event: any) => {
    const dateKey = new Date(event.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return {};
  }, {});

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Calendar</Text>
        <Text style={styles.headerSubtitle}>{events.length} upcoming events</Text>
      </View>

      {events.map((event: any, index: number) => {
        const showDateHeader =
          index === 0 ||
          new Date(event.date).toDateString() !== new Date(events[index - 1].date).toDateString();

        return (
          <View key={event.id}>
            {showDateHeader && (
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{formatDate(event.date)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(event)}>
              <View
                style={[
                  styles.eventIconContainer,
                  { backgroundColor: getEventColor(event.type) + '20' },
                ]}
              >
                <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.location && <Text style={styles.eventLocation}>📍 {event.location}</Text>}
                <View style={styles.eventMeta}>
                  <Text style={styles.eventTime}>{formatTime(event.date)}</Text>
                  <View
                    style={[styles.eventTypeBadge, { backgroundColor: getEventColor(event.type) }]}
                  >
                    <Text style={styles.eventTypeBadgeText}>{event.type.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sync with Google Calendar for more features</Text>
        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncButtonText}>🔗 Connect Calendar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  dateHeader: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIcon: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventTypeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  syncButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
});
