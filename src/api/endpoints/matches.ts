import { apiClient } from '../client';
import {
  Match,
  MatchSchema,
  MatchCreate,
  MatchUpdate,
  MatchResult,
  MatchStatusUpdate,
  SearchQuery,
} from '../models';

// Create Match
export const createMatch = (data: MatchCreate) =>
  apiClient
    .post<Match>('/matches', data)
    .then((res) => MatchSchema.parse(res.data));

// Get Matches (List/Search)
export const getMatches = (params?: SearchQuery & { startAt?: string }) =>
  apiClient
    .get<Match[]>('/matches', { params })
    .then((res) => MatchSchema.array().parse(res.data));

// Get Match by ID
export const getMatchById = (id: string) =>
  apiClient
    .get<Match>(`/matches/${id}`)
    .then((res) => MatchSchema.parse(res.data));

// Update Match
export const updateMatch = (id: string, data: MatchUpdate) =>
  apiClient
    .patch<Match>(`/matches/${id}`, data)
    .then((res) => MatchSchema.parse(res.data));

// Delete/Cancel Match
export const deleteMatch = (id: string) =>
  apiClient.delete(`/matches/${id}`).then((res) => res.data);

// Join Match
export const joinMatch = (id: string) =>
  apiClient
    .post<{ message: string }>(`/matches/${id}/join`)
    .then((res) => res.data);

// Leave Match
export const leaveMatch = (id: string) =>
  apiClient
    .post<{ message: string }>(`/matches/${id}/leave`)
    .then((res) => res.data);

// Update Match Score
export const updateMatchScore = (id: string, data: MatchResult) =>
  apiClient
    .put<Match>(`/matches/${id}/score`, data)
    .then((res) => MatchSchema.parse(res.data));

// Update Match Status
export const updateMatchStatus = (id: string, data: MatchStatusUpdate) =>
  apiClient
    .put<Match>(`/matches/${id}/status`, data)
    .then((res) => MatchSchema.parse(res.data));

// Start Match (Legacy)
export const startMatch = (id: string) =>
  apiClient
    .post<Match>(`/matches/${id}/start`)
    .then((res) => MatchSchema.parse(res.data));

// Finish Match (Legacy)
export const finishMatch = (id: string, data: MatchResult) =>
  apiClient
    .post<Match>(`/matches/${id}/finish`, data)
    .then((res) => MatchSchema.parse(res.data));
