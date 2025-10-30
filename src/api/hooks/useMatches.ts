import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as matchEndpoints from '../endpoints/matches';
import { MatchCreate, MatchUpdate, MatchResult, MatchStatusUpdate, SearchQuery } from '../models';

// Query Keys
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters?: SearchQuery & { startAt?: string }) => [...matchKeys.lists(), filters] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
};

// ===== QUERIES =====

// Get Matches
export const useGetMatches = (params?: SearchQuery & { startAt?: string }) =>
  useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => matchEndpoints.getMatches(params),
  });

// Get Match by ID
export const useGetMatchById = (id: string) =>
  useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchEndpoints.getMatchById(id),
    enabled: !!id,
  });

// ===== MUTATIONS =====

// Create Match
export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MatchCreate) => matchEndpoints.createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Update Match
export const useUpdateMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchUpdate }) =>
      matchEndpoints.updateMatch(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(matchKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Delete Match
export const useDeleteMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => matchEndpoints.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
    },
  });
};

// Join Match
export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => matchEndpoints.joinMatch(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Leave Match
export const useLeaveMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => matchEndpoints.leaveMatch(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Update Match Score
export const useUpdateMatchScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchResult }) =>
      matchEndpoints.updateMatchScore(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(matchKeys.detail(data.id), data);
    },
  });
};

// Update Match Status
export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchStatusUpdate }) =>
      matchEndpoints.updateMatchStatus(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(matchKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Start Match (Legacy)
export const useStartMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => matchEndpoints.startMatch(id),
    onSuccess: (data) => {
      queryClient.setQueryData(matchKeys.detail(data.id), data);
    },
  });
};

// Finish Match (Legacy)
export const useFinishMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchResult }) =>
      matchEndpoints.finishMatch(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(matchKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate user stats
    },
  });
};
