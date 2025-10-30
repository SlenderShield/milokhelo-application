import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  areNotificationsEnabled,
  clearBadgeCount,
} from '../services/pushNotifications';
import { useRegisterPushToken } from '../api/hooks';

/**
 * Custom hook to manage push notifications in the app
 * Handles registration, token management, and notification listening
 */
export function usePushNotifications() {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Mutation to register token with backend
  const registerToken = useRegisterPushToken();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        setIsRegistered(true);

        // Register token with backend (use 'android' or 'ios' based on platform)
        try {
          await registerToken.mutateAsync({ 
            token, 
            platform: 'android' // This would be determined by Platform.OS
          });
          console.log('Push token registered with backend');
        } catch (error) {
          console.error('Failed to register token with backend:', error);
        }
      }
    });

    // Set up notification listeners
    const listeners = setupNotificationListeners(
      // When notification is received (app in foreground)
      (notification) => {
        setNotification(notification);
      },
      // When user taps on notification
      (response) => {
        handleNotificationResponse(response);
      }
    );

    notificationListener.current = listeners.receivedSubscription;
    responseListener.current = listeners.responseSubscription;

    // Cleanup
    return () => {
      listeners.remove();
    };
  }, []);

  /**
   * Handle notification tap - navigate to relevant screen
   */
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    // Clear badge count when opening a notification
    clearBadgeCount();

    // Navigate based on notification type
    if (data?.type === 'match' && data?.matchId) {
      router.push(`/matches/${data.matchId}`);
    } else if (data?.type === 'tournament' && data?.tournamentId) {
      router.push(`/tournaments/${data.tournamentId}`);
    } else if (data?.type === 'team' && data?.teamId) {
      router.push(`/teams/${data.teamId}`);
    } else if (data?.type === 'invitation') {
      router.push('/notifications');
    } else if (data?.type === 'message' && data?.roomId) {
      router.push(`/chat/${data.roomId}`);
    } else if (data?.screen) {
      // Generic screen navigation
      router.push(data.screen as any);
    }
  };

  /**
   * Check if notifications are currently enabled
   */
  const checkNotificationStatus = async () => {
    const enabled = await areNotificationsEnabled();
    return enabled;
  };

  return {
    expoPushToken,
    isRegistered,
    notification,
    checkNotificationStatus,
  };
}
