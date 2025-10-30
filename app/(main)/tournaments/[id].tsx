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
import {
  useGetTournamentById,
  useGetTournamentBracket,
  useJoinTournament,
  useLeaveTournament,
  useRegisterForTournament,
} from '@/src/api/hooks';
import { useAuth } from '@/src/context/AuthContext';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // Fetch tournament details
  const { data: tournament, isLoading, error, refetch } = useGetTournamentById(id);

  // Fetch bracket data if tournament is knockout type
  const {
    data: bracket,
    isLoading: bracketLoading,
    error: bracketError,
  } = useGetTournamentBracket(id, {
    enabled: tournament?.type === 'knockout',
  });

  // Mutations
  const joinTournament = useJoinTournament();
  const leaveTournament = useLeaveTournament();
  const registerForTournament = useRegisterForTournament();

  // Check if user is a participant
  const isParticipant = tournament?.participants?.some(
    (participant) => typeof participant === 'string' ? participant === user?.id : participant === user?.id
  ) || tournament?.teams?.includes(user?.id || '');

  // Check if user is the organizer
  const isOrganizer = tournament && user && (tournament.organizerId === user.id || tournament.organizer === user.id);

  const handleJoinTournament = async () => {
    if (!id) return;

    // TODO: Add team selection UI - tournaments require a teamId
    Alert.alert('Info', 'Tournament registration requires team selection. This feature will be available soon.');
    return;

    /* Commented out until team selection UI is added
    try {
      await joinTournament.mutateAsync({ id, data: { teamId: 'SELECTED_TEAM_ID' } });
      Alert.alert('Success', 'You have joined the tournament!');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to join tournament');
    }
    */
  };

  const handleRegister = async () => {
    if (!id) return;

    // TODO: Add team selection UI - tournaments require a teamId
    Alert.alert('Info', 'Tournament registration requires team selection. This feature will be available soon.');
    return;

    /* Commented out until team selection UI is added
    try {
      await registerForTournament.mutateAsync({ id, data: { teamId: 'SELECTED_TEAM_ID' } });
      Alert.alert('Success', 'Registration submitted!');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to register');
    }
    */
  };

  const handleLeaveTournament = async () => {
    if (!id) return;

    // TODO: Update when leaveTournament API is clarified (may need teamId)
    Alert.alert('Info', 'Leave tournament feature will be available soon.');
    return;

    /* Commented out until API is clarified
    Alert.alert(
      'Leave Tournament',
      'Are you sure you want to leave this tournament?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveTournament.mutateAsync(id);
              Alert.alert('Success', 'You have left the tournament');
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to leave tournament');
            }
          },
        },
      ]
    );
    */
  };

  // Status badge color
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

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading tournament...</Text>
      </View>
    );
  }

  // Error state
  if (error || !tournament) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load tournament</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || 'Tournament not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tournament Header */}
      <View style={styles.header}>
        <Text style={styles.tournamentName}>{tournament.title || tournament.name}</Text>
        <Text style={styles.tournamentSport}>{tournament.sport}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(tournament.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Tournament Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {tournament.type === 'knockout' ? '🏆 Knockout' : '📊 League'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>
              {tournament.participants?.length || 0}
              {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
            </Text>
          </View>
        </View>

        {tournament.startDate && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Start Date:</Text>
            <Text style={styles.dateValue}>
              {new Date(tournament.startDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        {tournament.endDate && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>End Date:</Text>
            <Text style={styles.dateValue}>
              {new Date(tournament.endDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {tournament.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{tournament.description}</Text>
        </View>
      )}

      {/* Bracket Visualization (Knockout Only) */}
      {tournament.type === 'knockout' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Bracket</Text>
          {bracketLoading ? (
            <View style={styles.bracketLoading}>
              <ActivityIndicator size="small" color="#6200ee" />
              <Text style={styles.bracketLoadingText}>Loading bracket...</Text>
            </View>
          ) : bracketError ? (
            <Text style={styles.errorSubtext}>Failed to load bracket</Text>
          ) : bracket && bracket.rounds && bracket.rounds.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.bracketContainer}>
                {bracket.rounds.map((round, roundIndex) => (
                  <View key={roundIndex} style={styles.roundColumn}>
                    <Text style={styles.roundTitle}>{round.name || `Round ${roundIndex + 1}`}</Text>
                    {round.matches?.map((match, matchIndex) => (
                      <View key={matchIndex} style={styles.matchCard}>
                        <View style={styles.matchTeam}>
                          <Text style={styles.matchTeamName}>
                            {match.team1?.name || 'TBD'}
                          </Text>
                          {match.score1 !== undefined && (
                            <Text style={styles.matchScore}>{match.score1}</Text>
                          )}
                        </View>
                        <View style={styles.matchDivider} />
                        <View style={styles.matchTeam}>
                          <Text style={styles.matchTeamName}>
                            {match.team2?.name || 'TBD'}
                          </Text>
                          {match.score2 !== undefined && (
                            <Text style={styles.matchScore}>{match.score2}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.emptyBracketText}>
              Bracket not available yet. Check back after tournament starts.
            </Text>
          )}
        </View>
      )}

      {/* Participants List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Participants ({tournament.participants?.length || 0})
        </Text>
        {tournament.participants && tournament.participants.length > 0 ? (
          tournament.participants.map((participant, index) => (
            <View key={participant.id || index} style={styles.participantCard}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>
                  {participant.name?.substring(0, 1).toUpperCase() || 'P'}
                </Text>
              </View>
              <Text style={styles.participantName}>{participant.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No participants yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {isOrganizer && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/tournaments/${id}/edit`)}
          >
            <Text style={styles.editButtonText}>✏️ Edit Tournament</Text>
          </TouchableOpacity>
        )}
        {tournament.status === 'upcoming' && (
          <>
            {isParticipant ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveTournament}
                disabled={leaveTournament.isPending}
              >
                <Text style={styles.leaveButtonText}>
                  {leaveTournament.isPending ? 'Leaving...' : 'Leave Tournament'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoinTournament}
                  disabled={joinTournament.isPending}
                >
                  <Text style={styles.joinButtonText}>
                    {joinTournament.isPending ? 'Joining...' : 'Join Tournament'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={registerForTournament.isPending}
                >
                  <Text style={styles.registerButtonText}>
                    {registerForTournament.isPending ? 'Registering...' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
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
  tournamentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tournamentSport: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
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
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bracketContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
  },
  roundColumn: {
    minWidth: 200,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  matchTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  matchTeamName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 8,
  },
  matchDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  bracketLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bracketLoadingText: {
    marginLeft: 8,
    color: '#666',
  },
  emptyBracketText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  participantName: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
