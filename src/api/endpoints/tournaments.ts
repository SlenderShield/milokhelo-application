import { apiClient } from '../client';
import {
  Tournament,
  TournamentSchema,
  TournamentCreate,
  TournamentUpdate,
  TournamentRegister,
  MatchResultUpdate,
  TournamentBracket,
  TournamentBracketSchema,
  SearchQuery,
} from '../models';

// Create Tournament
export const createTournament = (data: TournamentCreate) =>
  apiClient
    .post<Tournament>('/tournaments', data)
    .then((res) => TournamentSchema.parse(res.data));

// Get Tournaments (List/Search)
export const getTournaments = (params?: SearchQuery & { type?: string }) =>
  apiClient
    .get<Tournament[]>('/tournaments', { params })
    .then((res) => TournamentSchema.array().parse(res.data));

// Get Tournament by ID
export const getTournamentById = (id: string) =>
  apiClient
    .get<Tournament>(`/tournaments/${id}`)
    .then((res) => TournamentSchema.parse(res.data));

// Update Tournament
export const updateTournament = (id: string, data: TournamentUpdate) =>
  apiClient
    .put<Tournament>(`/tournaments/${id}`, data)
    .then((res) => TournamentSchema.parse(res.data));

// Delete/Cancel Tournament
export const deleteTournament = (id: string) =>
  apiClient.delete(`/tournaments/${id}`).then((res) => res.data);

// Join Tournament
export const joinTournament = (id: string, data: TournamentRegister) =>
  apiClient
    .post<{ message: string }>(`/tournaments/${id}/join`, data)
    .then((res) => res.data);

// Leave Tournament
export const leaveTournament = (id: string, data: TournamentRegister) =>
  apiClient
    .post<{ message: string }>(`/tournaments/${id}/leave`, data)
    .then((res) => res.data);

// Register for Tournament (Legacy)
export const registerForTournament = (id: string, data: TournamentRegister) =>
  apiClient
    .post<{ message: string }>(`/tournaments/${id}/register`, data)
    .then((res) => res.data);

// Start Tournament
export const startTournament = (id: string) =>
  apiClient
    .put<Tournament>(`/tournaments/${id}/start`)
    .then((res) => TournamentSchema.parse(res.data));

// Get Tournament Bracket
export const getTournamentBracket = (id: string) =>
  apiClient
    .get<TournamentBracket>(`/tournaments/${id}/bracket`)
    .then((res) => TournamentBracketSchema.parse(res.data));

// Update Match Result in Tournament
export const updateTournamentMatchResult = (id: string, data: MatchResultUpdate) =>
  apiClient
    .post<{ bracket: TournamentBracket }>(`/tournaments/${id}/match-result`, data)
    .then((res) => TournamentBracketSchema.parse(res.data.bracket));
