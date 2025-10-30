import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamsApi from '../endpoints/teams';
import { TeamCreate, TeamUpdate, TeamJoin, SearchQuery } from '../models';

// Query Keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params?: SearchQuery) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// ===== QUERIES =====

// Get Teams (List/Search)
export const useGetTeams = (params?: SearchQuery) =>
  useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => teamsApi.getTeams(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Get Team by ID
export const useGetTeamById = (id: string) =>
  useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsApi.getTeamById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

// ===== MUTATIONS =====

// Create Team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamCreate) => teamsApi.createTeam(data),
    onSuccess: () => {
      // Invalidate teams list to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// Update Team
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamUpdate }) =>
      teamsApi.updateTeam(id, data),
    onSuccess: (updatedTeam) => {
      // Update the specific team in cache
      queryClient.setQueryData(teamKeys.detail(updatedTeam.id), updatedTeam);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// Delete Team
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsApi.deleteTeam(id),
    onSuccess: (_, id) => {
      // Remove the team from cache
      queryClient.removeQueries({ queryKey: teamKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// Join Team
export const useJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: TeamJoin }) =>
      teamsApi.joinTeam(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific team to refetch updated members
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// Leave Team
export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsApi.leaveTeam(id),
    onSuccess: (_, id) => {
      // Invalidate the specific team to refetch updated members
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};
