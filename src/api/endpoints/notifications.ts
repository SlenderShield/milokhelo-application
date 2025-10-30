import { apiClient } from '../client';
import {
  Notification,
  NotificationSchema,
  DeviceTokenRegister,
  Invitation,
  InvitationSchema,
  InvitationCreate,
  InvitationResponse,
  PaginationQuery,
} from '../models';

// ===== NOTIFICATIONS =====

// Get Notifications
export const getNotifications = (params?: PaginationQuery) =>
  apiClient
    .get<Notification[]>('/notifications', { params })
    .then((res) => NotificationSchema.array().parse(res.data));

// Get Notification by ID
export const getNotificationById = (id: string) =>
  apiClient
    .get<Notification>(`/notifications/${id}`)
    .then((res) => NotificationSchema.parse(res.data));

// Delete Notification
export const deleteNotification = (id: string) =>
  apiClient.delete(`/notifications/${id}`).then((res) => res.data);

// Mark Notification as Read
export const markNotificationAsRead = (id: string) =>
  apiClient
    .put<Notification>(`/notifications/${id}/read`)
    .then((res) => NotificationSchema.parse(res.data));

// Get Unread Count
export const getUnreadNotificationsCount = () =>
  apiClient
    .get<{ count: number }>('/notifications/unread/count')
    .then((res) => res.data);

// Mark All as Read
export const markAllNotificationsAsRead = () =>
  apiClient
    .patch<{ updated: number }>('/notifications/read-all')
    .then((res) => res.data);

// Register Push Token
export const registerPushToken = (data: DeviceTokenRegister) =>
  apiClient
    .post<{ message: string }>('/notifications/push-token', data)
    .then((res) => res.data);

// Unregister Push Token
export const unregisterPushToken = (token: string) =>
  apiClient
    .delete<{ message: string }>('/notifications/push-token', { data: { token } })
    .then((res) => res.data);

// ===== INVITATIONS =====

// Send Invitation
export const sendInvitation = (data: InvitationCreate) =>
  apiClient
    .post<Invitation>('/invitations', data)
    .then((res) => InvitationSchema.parse(res.data));

// Get Invitations
export const getInvitations = () =>
  apiClient
    .get<Invitation[]>('/invitations')
    .then((res) => InvitationSchema.array().parse(res.data));

// Respond to Invitation
export const respondToInvitation = (id: string, data: InvitationResponse) =>
  apiClient
    .post<Invitation>(`/invitations/${id}/respond`, data)
    .then((res) => InvitationSchema.parse(res.data));
