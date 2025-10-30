import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../endpoints/notifications';
import {
  DeviceTokenRegister,
  InvitationCreate,
  InvitationResponse,
  PaginationQuery,
} from '../models';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: PaginationQuery) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread', 'count'] as const,
  invitations: () => [...notificationKeys.all, 'invitations'] as const,
};

// ===== QUERIES =====

// Get Notifications
export const useGetNotifications = (params?: PaginationQuery) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds (frequent updates for notifications)
  });

// Get Notification by ID
export const useGetNotificationById = (id: string) =>
  useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getNotificationById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

// Get Unread Notifications Count
export const useGetUnreadNotificationsCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadNotificationsCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });

// Get Invitations
export const useGetInvitations = () =>
  useQuery({
    queryKey: notificationKeys.invitations(),
    queryFn: () => notificationsApi.getInvitations(),
    staleTime: 2 * 60 * 1000,
  });

// ===== MUTATIONS =====

// Delete Notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: (_, id) => {
      // Remove the notification from cache
      queryClient.removeQueries({ queryKey: notificationKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

// Mark Notification as Read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationAsRead(id),
    onSuccess: (updatedNotification) => {
      // Update the specific notification in cache
      queryClient.setQueryData(
        notificationKeys.detail(updatedNotification.id),
        updatedNotification
      );
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

// Mark All Notifications as Read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      // Invalidate all notification queries to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Register Push Token
export const useRegisterPushToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeviceTokenRegister) =>
      notificationsApi.registerPushToken(data),
    // No need to invalidate queries - this is just registration
  });
};

// Unregister Push Token
export const useUnregisterPushToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => notificationsApi.unregisterPushToken(token),
    // No need to invalidate queries - this is just unregistration
  });
};

// Send Invitation
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvitationCreate) => notificationsApi.sendInvitation(data),
    onSuccess: () => {
      // Invalidate invitations list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.invitations() });
      // Invalidate notifications list (invitation may appear there)
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

// Respond to Invitation
export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvitationResponse }) =>
      notificationsApi.respondToInvitation(id, data),
    onSuccess: () => {
      // Invalidate invitations list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.invitations() });
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};
