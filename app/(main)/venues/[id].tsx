import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  useGetVenueById,
  useGetVenueAvailability,
  useBookVenueSlot,
} from '@/src/api/hooks';

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Fetch venue details
  const { data: venue, isLoading, error, refetch } = useGetVenueById(id);

  // Check if current user is the owner (would need useAuth for this)
  // const { user } = useAuth();
  // const isOwner = venue && user && venue.ownerId === user.id;

  // Fetch availability for selected date
  const {
    data: availability,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useGetVenueAvailability(id, selectedDate);

  // Book slot mutation
  const bookSlot = useBookVenueSlot();

  const handleBookSlot = (slotId: string, startTime: string, endTime: string) => {
    Alert.alert(
      'Confirm Booking',
      `Book this slot from ${startTime} to ${endTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: async () => {
            try {
              await bookSlot.mutateAsync({
                venueId: id,
                data: {
                  date: selectedDate,
                  startTime,
                  endTime,
                  sport: 'Football', // TODO: Add sport selection
                },
              });
              Alert.alert('Success', 'Slot booked successfully!');
              refetchAvailability();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to book slot');
            }
          },
        },
      ]
    );
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !venue) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load venue</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || 'Venue not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Venue Header */}
      <View style={styles.header}>
        <View style={styles.venueImageLarge}>
          <Text style={styles.venueImageIcon}>🏟️</Text>
        </View>
        <Text style={styles.venueName}>{venue.name}</Text>
        {venue.address && (
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{venue.address}</Text>
          </View>
        )}
      </View>

      {/* Venue Stats */}
      <View style={styles.statsCard}>
        {venue.rating && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{venue.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        )}
        {venue.priceRange && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>${venue.priceRange.min}-${venue.priceRange.max}</Text>
            <Text style={styles.statLabel}>Price Range</Text>
          </View>
        )}
      </View>

      {/* Sports Available */}
      {venue.sportsSupported && venue.sportsSupported.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports Available</Text>
          <View style={styles.sportsContainer}>
            {venue.sportsSupported.map((sport: string, index: number) => (
              <View key={index} style={styles.sportChip}>
                <Text style={styles.sportChipText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {venue.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{venue.description}</Text>
        </View>
      )}

      {/* Amenities */}
      {venue.amenities && venue.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {venue.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>✓</Text>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Booking Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book a Slot</Text>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeDate(-1)}
            disabled={selectedDate === new Date().toISOString().split('T')[0]}
          >
            <Text style={styles.dateArrowText}>←</Text>
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => changeDate(1)}
          >
            <Text style={styles.dateArrowText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Available Slots */}
        {availabilityLoading ? (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color="#6200ee" />
            <Text style={styles.slotsLoadingText}>Loading availability...</Text>
          </View>
        ) : availability && availability.slots && availability.slots.length > 0 ? (
          <View style={styles.slotsContainer}>
            {availability.slots.map((slot: any) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  !slot.available && styles.slotCardDisabled,
                ]}
                onPress={() =>
                  slot.available &&
                  handleBookSlot(slot.id, slot.startTime, slot.endTime)
                }
                disabled={!slot.available || bookSlot.isPending}
              >
                <Text
                  style={[
                    styles.slotTime,
                    !slot.available && styles.slotTimeDisabled,
                  ]}
                >
                  {slot.startTime} - {slot.endTime}
                </Text>
                <Text
                  style={[
                    styles.slotStatus,
                    slot.available
                      ? styles.slotStatusAvailable
                      : styles.slotStatusBooked,
                  ]}
                >
                  {slot.available ? 'Available' : 'Booked'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noSlotsText}>
            No availability information for this date
          </Text>
        )}
      </View>

      {/* Owner Actions */}
      {/* Uncomment when useAuth is available */}
      {/* {isOwner && (
        <View style={styles.ownerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/venues/${id}/edit`)}
          >
            <Text style={styles.editButtonText}>✏️ Edit Venue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push(`/venues/dashboard`)}
          >
            <Text style={styles.manageButtonText}>📊 Manage Bookings</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Contact Info */}
      {(venue.contact?.phone || venue.contactInfo?.phone || venue.contact?.email || venue.contactInfo?.email) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {(venue.contact?.phone || venue.contactInfo?.phone) && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{venue.contact?.phone || venue.contactInfo?.phone}</Text>
            </View>
          )}
          {(venue.contact?.email || venue.contactInfo?.email) && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>{venue.contact?.email || venue.contactInfo?.email}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  venueImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  venueImageIcon: {
    fontSize: 56,
  },
  venueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportChipText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
  },
  dateArrowText: {
    fontSize: 24,
    color: '#6200ee',
  },
  dateDisplay: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  slotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  slotsLoadingText: {
    marginLeft: 8,
    color: '#666',
  },
  slotsContainer: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  slotCardDisabled: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  slotTimeDisabled: {
    color: '#999',
  },
  slotStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotStatusAvailable: {
    color: '#4CAF50',
  },
  slotStatusBooked: {
    color: '#F44336',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
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
