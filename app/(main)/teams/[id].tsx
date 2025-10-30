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
import { useGetTeamById, useJoinTeam, useLeaveTeam } from '@/src/api/hooks';
import { useAuth } from '@/src/context/AuthContext';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // Fetch team details
  const { data: team, isLoading, error, refetch } = useGetTeamById(id);

  // Mutations
  const joinTeam = useJoinTeam();
  const leaveTeam = useLeaveTeam();

  // Check if user is a member
  const isMember = team?.members?.some((member) => member.id === user?.id);
  const isCaptain = team?.captain?.id === user?.id;

  const handleJoinTeam = async () => {
    if (!id) return;

    try {
      await joinTeam.mutateAsync({ id });
      Alert.alert('Success', 'You have joined the team!');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to join team');
    }
  };

  const handleLeaveTeam = async () => {
    if (!id) return;

    Alert.alert('Leave Team', 'Are you sure you want to leave this team?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveTeam.mutateAsync(id);
            Alert.alert('Success', 'You have left the team');
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to leave team');
          }
        },
      },
    ]);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading team details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !team) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load team</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || 'Team not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Team Header */}
      <View style={styles.header}>
        <View style={styles.teamAvatar}>
          <Text style={styles.teamAvatarText}>
            {team.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamSport}>{team.sport}</Text>
      </View>

      {/* Team Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{team.members?.length || 0}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{team.wins || 0}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{team.losses || 0}</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {team.wins && team.losses
              ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(0)
              : 0}
            %
          </Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Team Bio */}
      {team.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{team.bio}</Text>
        </View>
      )}

      {/* Captain */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Captain</Text>
        <View style={styles.memberCard}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {team.captain?.name?.substring(0, 1).toUpperCase() || 'C'}
            </Text>
          </View>
          <Text style={styles.memberName}>
            {team.captain?.name || 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Members List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Members ({team.members?.length || 0})
        </Text>
        {team.members && team.members.length > 0 ? (
          team.members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name?.substring(0, 1).toUpperCase() || 'M'}
                </Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No members yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {isMember ? (
          <>
            {isCaptain && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/teams/${id}/edit`)}
              >
                <Text style={styles.editButtonText}>Edit Team</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveTeam}
              disabled={leaveTeam.isPending}
            >
              <Text style={styles.leaveButtonText}>
                {leaveTeam.isPending ? 'Leaving...' : 'Leave Team'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinTeam}
            disabled={joinTeam.isPending}
          >
            <Text style={styles.joinButtonText}>
              {joinTeam.isPending ? 'Joining...' : 'Join Team'}
            </Text>
          </TouchableOpacity>
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
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  teamSport: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  memberName: {
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
  joinButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#4CAF50',
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
