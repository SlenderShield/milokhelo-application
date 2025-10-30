import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tournamentsApi from '../endpoints/tournaments';
import {
  TournamentCreate,
  TournamentUpdate,
  TournamentRegister,
  MatchResultUpdate,
  SearchQuery,
} from '../models';

// Query Keys
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (params?: SearchQuery & { type?: string }) => [...tournamentKeys.lists(), params] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
  bracket: (id: string) => [...tournamentKeys.detail(id), 'bracket'] as const,
};

// ===== QUERIES =====

// Get Tournaments (List/Search)
export const useGetTournaments = (params?: SearchQuery & { type?: string }) =>
  useQuery({
    queryKey: tournamentKeys.list(params),
    queryFn: () => tournamentsApi.getTournaments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Get Tournament by ID
export const useGetTournamentById = (id: string) =>
  useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.getTournamentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

// Get Tournament Bracket
export const useGetTournamentBracket = (id: string) =>
  useQuery({
    queryKey: tournamentKeys.bracket(id),
    queryFn: () => tournamentsApi.getTournamentBracket(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates during tournament)
  });

// ===== MUTATIONS =====

// Create Tournament
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TournamentCreate) => tournamentsApi.createTournament(data),
    onSuccess: () => {
      // Invalidate tournaments list to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Update Tournament
export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TournamentUpdate }) =>
      tournamentsApi.updateTournament(id, data),
    onSuccess: updatedTournament => {
      // Update the specific tournament in cache
      queryClient.setQueryData(tournamentKeys.detail(updatedTournament.id), updatedTournament);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Delete Tournament
export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentsApi.deleteTournament(id),
    onSuccess: (_, id) => {
      // Remove the tournament from cache
      queryClient.removeQueries({ queryKey: tournamentKeys.detail(id) });
      queryClient.removeQueries({ queryKey: tournamentKeys.bracket(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Join Tournament
export const useJoinTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TournamentRegister }) =>
      tournamentsApi.joinTournament(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific tournament to refetch updated participants
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Leave Tournament
export const useLeaveTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TournamentRegister }) =>
      tournamentsApi.leaveTournament(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific tournament to refetch updated participants
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Register for Tournament (alias for join)
export const useRegisterForTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TournamentRegister }) =>
      tournamentsApi.registerForTournament(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific tournament to refetch updated participants
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Start Tournament
export const useStartTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentsApi.startTournament(id),
    onSuccess: updatedTournament => {
      // Update the tournament in cache
      queryClient.setQueryData(tournamentKeys.detail(updatedTournament.id), updatedTournament);
      // Invalidate bracket to refetch generated bracket
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.bracket(updatedTournament.id),
      });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Update Tournament Match Result
export const useUpdateTournamentMatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchResultUpdate }) =>
      tournamentsApi.updateTournamentMatchResult(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate tournament detail
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(id) });
      // Invalidate bracket to refetch updated bracket
      queryClient.invalidateQueries({ queryKey: tournamentKeys.bracket(id) });
    },
  });
};
