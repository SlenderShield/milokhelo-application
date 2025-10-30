import { apiClient } from '../client';
import { Team, TeamSchema, TeamCreate, TeamUpdate, TeamJoin, SearchQuery } from '../models';

// Create Team
export const createTeam = (data: TeamCreate) =>
  apiClient.post<Team>('/teams', data).then(res => TeamSchema.parse(res.data));

// Get Teams (List/Search)
export const getTeams = (params?: SearchQuery) =>
  apiClient.get<Team[]>('/teams', { params }).then(res => TeamSchema.array().parse(res.data));

// Get Team by ID
export const getTeamById = (id: string) =>
  apiClient.get<Team>(`/teams/${id}`).then(res => TeamSchema.parse(res.data));

// Update Team
export const updateTeam = (id: string, data: TeamUpdate) =>
  apiClient.put<Team>(`/teams/${id}`, data).then(res => TeamSchema.parse(res.data));

// Delete Team
export const deleteTeam = (id: string) => apiClient.delete(`/teams/${id}`).then(res => res.data);

// Join Team
export const joinTeam = (id: string, data?: TeamJoin) =>
  apiClient.post<{ message: string }>(`/teams/${id}/join`, data).then(res => res.data);

// Leave Team
export const leaveTeam = (id: string) =>
  apiClient.post<{ message: string }>(`/teams/${id}/leave`).then(res => res.data);
