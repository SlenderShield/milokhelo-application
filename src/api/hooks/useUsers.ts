import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userEndpoints from '../endpoints/users';
import { UserUpdate, PaginationQuery, SearchQuery } from '../models';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: SearchQuery & PaginationQuery) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
  stats: (id: string) => [...userKeys.all, 'stats', id] as const,
  achievements: (id: string) => [...userKeys.all, 'achievements', id] as const,
  myAchievements: () => [...userKeys.all, 'achievements', 'me'] as const,
  friends: (id: string) => [...userKeys.all, 'friends', id] as const,
};

// ===== QUERIES =====

// Get My Profile
export const useGetMyProfile = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: userEndpoints.getMyProfile,
  });

// Search Users
export const useSearchUsers = (params: SearchQuery & PaginationQuery) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userEndpoints.searchUsers(params),
    enabled: !!params.q || !!params.query,
  });

// Get User by ID
export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userEndpoints.getUserById(id),
    enabled: !!id,
  });

// Get User Stats
export const useGetUserStats = (id: string) =>
  useQuery({
    queryKey: userKeys.stats(id),
    queryFn: () => userEndpoints.getUserStats(id),
    enabled: !!id,
  });

// Get My Achievements
export const useGetMyAchievements = () =>
  useQuery({
    queryKey: userKeys.myAchievements(),
    queryFn: userEndpoints.getMyAchievements,
  });

// Get User Achievements
export const useGetUserAchievements = (id: string) =>
  useQuery({
    queryKey: userKeys.achievements(id),
    queryFn: () => userEndpoints.getUserAchievements(id),
    enabled: !!id,
  });

// Get User Friends
export const useGetUserFriends = (id: string) =>
  useQuery({
    queryKey: userKeys.friends(id),
    queryFn: () => userEndpoints.getUserFriends(id),
    enabled: !!id,
  });

// ===== MUTATIONS =====

// Update My Profile
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdate) => userEndpoints.updateMyProfile(data),
    onSuccess: data => {
      queryClient.setQueryData(userKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Add Friend
export const useAddFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => userEndpoints.addFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Remove Friend
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => userEndpoints.removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
