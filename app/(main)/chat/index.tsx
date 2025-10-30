import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetChatRooms, useCreateChatRoom } from '@/src/api/hooks';
import { ListLoadingState, EmptyState, ErrorState } from '@/src/components/LoadingState';

export default function ChatRoomsScreen() {
  const router = useRouter();

  // Fetch chat rooms
  const { data: chatRooms, isLoading, error, refetch } = useGetChatRooms();

  const createRoom = useCreateChatRoom();

  const handleCreateRoom = () => {
    Alert.prompt(
      'Create Chat Room',
      'Enter room name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (roomName: string | undefined) => {
            if (!roomName || !roomName.trim()) {
              Alert.alert('Error', 'Room name is required');
              return;
            }

            try {
              // TODO: Add participant selection UI, for now create with empty participants array
              const room = await createRoom.mutateAsync({
                name: roomName.trim(),
                participants: [], // Should select participants in a proper UI
              });
              refetch();
              router.push(`/chat/${room.id}`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to create room');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ListLoadingState count={5} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState title="Failed to load chat rooms" message={error.message} onRetry={refetch} />
      </View>
    );
  }

  // Empty state
  if (!chatRooms || chatRooms.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="💬"
          title="No chat rooms yet"
          message="Create a room to start chatting"
          action={{
            label: 'Create Room',
            onPress: handleCreateRoom,
          }}
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={handleCreateRoom}>
          <Text style={styles.fabText}>+ New Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
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
          <TouchableOpacity style={styles.roomCard} onPress={() => router.push(`/chat/${item.id}`)}>
            <View style={styles.roomAvatar}>
              <Text style={styles.roomAvatarText}>
                {(item.name || 'CR').substring(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={styles.roomInfo}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomName}>{item.name || 'Chat Room'}</Text>
                {item.lastMessage?.timestamp && (
                  <Text style={styles.roomTime}>{formatTime(item.lastMessage.timestamp)}</Text>
                )}
              </View>

              {item.lastMessage ? (
                <View style={styles.lastMessageContainer}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage.content}
                  </Text>
                  {/* TODO: Add unreadCount to ChatRoom model on backend */}
                </View>
              ) : (
                <Text style={styles.noMessages}>No messages yet</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateRoom}>
        <Text style={styles.fabText}>+ New Room</Text>
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
  listContent: {
    padding: 16,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roomAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  roomTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  noMessages: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
