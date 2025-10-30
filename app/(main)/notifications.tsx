import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import {
  useGetNotifications,
  useGetUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useGetInvitations,
  useRespondToInvitation,
} from '@/src/api/hooks';

type Tab = 'notifications' | 'invitations';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');

  // Fetch notifications
  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useGetNotifications();

  // Fetch invitations
  const {
    data: invitations,
    isLoading: invitationsLoading,
    error: invitationsError,
    refetch: refetchInvitations,
  } = useGetInvitations();

  // Unread count
  const { data: unreadCount } = useGetUnreadNotificationsCount();

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const respondToInvitation = useRespondToInvitation();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      refetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      refetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification.mutateAsync(notificationId);
            refetchNotifications();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete notification');
          }
        },
      },
    ]);
  };

  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      await respondToInvitation.mutateAsync({
        id: invitationId,
        data: { response: accept ? 'accept' : 'decline' },
      });
      refetchInvitations();
      Alert.alert('Success', accept ? 'Invitation accepted!' : 'Invitation declined');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to respond to invitation');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return '⚽';
      case 'team':
        return '👥';
      case 'tournament':
        return '🏆';
      case 'invitation':
        return '✉️';
      case 'system':
        return '📢';
      default:
        return '🔔';
    }
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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: any) => (
    <View style={styles.notificationCard}>
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => !item.read && handleMarkAsRead(item.id)}
      >
        <View style={styles.notificationLeft}>
          <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.notificationBody}>
          <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderInvitation = ({ item }: any) => (
    <View style={styles.invitationCard}>
      <View style={styles.invitationHeader}>
        <Text style={styles.invitationIcon}>✉️</Text>
        <View style={styles.invitationHeaderText}>
          <Text style={styles.invitationTitle}>{item.title}</Text>
          <Text style={styles.invitationTime}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.invitationMessage}>{item.message}</Text>

      {item.status === 'pending' && (
        <View style={styles.invitationActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleInvitationResponse(item.id, true)}
            disabled={respondToInvitation.isPending}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleInvitationResponse(item.id, false)}
            disabled={respondToInvitation.isPending}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status !== 'pending' && (
        <View style={styles.invitationStatus}>
          <Text
            style={[
              styles.invitationStatusText,
              item.status === 'accepted' ? styles.statusAccepted : styles.statusDeclined,
            ]}
          >
            {item.status === 'accepted' ? '✓ Accepted' : '✗ Declined'}
          </Text>
        </View>
      )}
    </View>
  );

  const isLoading = notificationsLoading || invitationsLoading;
  const error = notificationsError || invitationsError;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            refetchNotifications();
            refetchInvitations();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentData = activeTab === 'notifications' ? notifications : invitations;
  const isEmpty = !currentData || currentData.length === 0;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
            Notifications
          </Text>
          {unreadCount && unreadCount.count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount.count}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invitations' && styles.tabActive]}
          onPress={() => setActiveTab('invitations')}
        >
          <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
            Invitations
          </Text>
          {invitations && invitations.filter((inv: any) => inv.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {invitations.filter((inv: any) => inv.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Mark All as Read Button */}
      {activeTab === 'notifications' &&
        notifications &&
        notifications.length > 0 &&
        unreadCount &&
        unreadCount.count > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <Text style={styles.markAllButtonText}>
                {markAllAsRead.isPending ? 'Marking...' : 'Mark all as read'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* List */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{activeTab === 'notifications' ? '🔔' : '✉️'}</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'notifications' ? 'No notifications yet' : 'No invitations yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData as any[]}
          keyExtractor={(item: any) => item.id}
          renderItem={activeTab === 'notifications' ? renderNotification : renderInvitation}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={() => {
            if (activeTab === 'notifications') {
              refetchNotifications();
            } else {
              refetchInvitations();
            }
          }}
        />
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#6200ee',
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 32,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200ee',
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    color: '#333',
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  invitationHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  invitationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  invitationHeaderText: {
    flex: 1,
  },
  invitationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  invitationTime: {
    fontSize: 12,
    color: '#999',
  },
  invitationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  invitationStatus: {
    paddingVertical: 8,
  },
  invitationStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusAccepted: {
    color: '#4CAF50',
  },
  statusDeclined: {
    color: '#999',
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
    fontSize: 16,
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
});
