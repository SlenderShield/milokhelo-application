import { apiClient } from '../client';
import { MapSubmission } from '../models';

// Get Nearby Venue Pins for Maps
export const getNearbyVenuePins = (params: { lat: number; lng: number; radius?: number }) =>
  apiClient.get<any[]>('/maps/nearby', { params }).then(res => res.data);

// Submit Location for Match/Tournament
export const submitMapLocation = (data: MapSubmission) =>
  apiClient.post<{ message: string; location: any }>('/maps/submit', data).then(res => res.data);

// Get Stored Location for Entity
export const getEntityLocation = (entityType: 'match' | 'tournament', entityId: string) =>
  apiClient.get<any>(`/maps/${entityType}/${entityId}`).then(res => res.data);
