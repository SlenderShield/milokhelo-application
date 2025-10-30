import { apiClient } from '../client';
import {
  UserProfile,
  UserProfileSchema,
  UserUpdate,
  UserStat,
  UserStatSchema,
  Achievement,
  AchievementSchema,
  PaginationQuery,
  SearchQuery,
} from '../models';

// Get Current User Profile
export const getMyProfile = () =>
  apiClient
    .get<UserProfile>('/users/me')
    .then((res) => UserProfileSchema.parse(res.data));

// Update Current User Profile
export const updateMyProfile = (data: UserUpdate) =>
  apiClient
    .put<UserProfile>('/users/me', data)
    .then((res) => UserProfileSchema.parse(res.data));

// Search Users
export const searchUsers = (params: SearchQuery & PaginationQuery) =>
  apiClient
    .get<UserProfile[]>('/users/search', { params })
    .then((res) => UserProfileSchema.array().parse(res.data));

// Get User by ID (Legacy endpoint)
export const getUserById = (id: string) =>
  apiClient
    .get<UserProfile>(`/users/${id}`)
    .then((res) => UserProfileSchema.parse(res.data));

// Get User Stats
export const getUserStats = (id: string) =>
  apiClient
    .get<UserStat[]>(`/users/${id}/stats`)
    .then((res) => UserStatSchema.array().parse(res.data));

// Get My Achievements
export const getMyAchievements = () =>
  apiClient
    .get<Achievement[]>('/users/me/achievements')
    .then((res) => AchievementSchema.array().parse(res.data));

// Get User Achievements
export const getUserAchievements = (id: string) =>
  apiClient
    .get<Achievement[]>(`/users/${id}/achievements`)
    .then((res) => AchievementSchema.array().parse(res.data));

// Get User Friends
export const getUserFriends = (id: string) =>
  apiClient
    .get<UserProfile[]>(`/users/${id}/friends`)
    .then((res) => UserProfileSchema.array().parse(res.data));

// Add Friend
export const addFriend = (friendId: string) =>
  apiClient
    .post<{ message: string }>(`/users/${friendId}/friend`)
    .then((res) => res.data);

// Remove Friend
export const removeFriend = (friendId: string) =>
  apiClient
    .delete<{ message: string }>(`/users/${friendId}/friend`)
    .then((res) => res.data);
