import { useQuery } from '@tanstack/react-query';
import * as mapsApi from '../endpoints/maps';
import { MapSubmission } from '../models';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const mapKeys = {
  all: ['maps'] as const,
  nearby: (params: { lat: number; lng: number; radius?: number }) =>
    [...mapKeys.all, 'nearby', params] as const,
  entity: (entityType: 'match' | 'tournament', entityId: string) =>
    [...mapKeys.all, 'entity', entityType, entityId] as const,
};

// ===== QUERIES =====

// Get Nearby Venue Pins
export const useGetNearbyVenuePins = (params: { lat: number; lng: number; radius?: number }) =>
  useQuery({
    queryKey: mapKeys.nearby(params),
    queryFn: () => mapsApi.getNearbyVenuePins(params),
    enabled: !!params.lat && !!params.lng,
    staleTime: 2 * 60 * 1000, // 2 minutes (location data changes frequently)
  });

// Get Entity Location
export const useGetEntityLocation = (entityType: 'match' | 'tournament', entityId: string) =>
  useQuery({
    queryKey: mapKeys.entity(entityType, entityId),
    queryFn: () => mapsApi.getEntityLocation(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000,
  });

// ===== MUTATIONS =====

// Submit Map Location
export const useSubmitMapLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MapSubmission) => mapsApi.submitMapLocation(data),
    onSuccess: (response, data) => {
      // Invalidate entity location query if it exists
      if (data.entityType && data.entityId) {
        queryClient.invalidateQueries({
          queryKey: mapKeys.entity(data.entityType, data.entityId),
        });
      }
    },
  });
};
