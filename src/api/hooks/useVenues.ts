import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as venuesApi from '../endpoints/venues';
import { VenueCreate, VenueUpdate, BookingCreate, PaginationQuery, SearchQuery } from '../models';

// Query Keys
export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (params?: PaginationQuery | SearchQuery) => [...venueKeys.lists(), params] as const,
  nearby: (params: { lat: number; lng: number; radius?: number }) =>
    [...venueKeys.all, 'nearby', params] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  availability: (id: string, date: string) =>
    [...venueKeys.detail(id), 'availability', date] as const,
  myVenues: () => [...venueKeys.all, 'my'] as const,
  slots: (id: string) => [...venueKeys.detail(id), 'slots'] as const,
  bookings: (id: string) => [...venueKeys.detail(id), 'bookings'] as const,
};

// ===== PUBLIC VENUE QUERIES =====

// Get Venues (List)
export const useGetVenues = (params?: PaginationQuery) =>
  useQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => venuesApi.getVenues(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Search Venues
export const useSearchVenues = (params: SearchQuery) =>
  useQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => venuesApi.searchVenues(params),
    enabled: !!params.q || !!params.query,
    staleTime: 5 * 60 * 1000,
  });

// Get Nearby Venues
export const useGetNearbyVenues = (params: {
  lat: number;
  lng: number;
  radius?: number;
  sport?: string;
  available?: boolean;
}) =>
  useQuery({
    queryKey: venueKeys.nearby(params),
    queryFn: () => venuesApi.getNearbyVenues(params),
    enabled: !!params.lat && !!params.lng,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for location-based)
  });

// Get Venue by ID
export const useGetVenueById = (venueId: string) =>
  useQuery({
    queryKey: venueKeys.detail(venueId),
    queryFn: () => venuesApi.getVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

// Get Venue Availability
export const useGetVenueAvailability = (venueId: string, date: string) =>
  useQuery({
    queryKey: venueKeys.availability(venueId, date),
    queryFn: () => venuesApi.getVenueAvailability(venueId, date),
    enabled: !!venueId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute (frequent updates for availability)
  });

// ===== PUBLIC VENUE MUTATIONS =====

// Book Venue Slot
export const useBookVenueSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: BookingCreate }) =>
      venuesApi.bookVenueSlot(venueId, data),
    onSuccess: (_, { venueId, data }) => {
      // Invalidate availability for the booked date
      if (data.date) {
        queryClient.invalidateQueries({
          queryKey: venueKeys.availability(venueId, data.date),
        });
      }
      // Invalidate venue detail to refetch
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(venueId) });
    },
  });
};

// ===== VENUE MANAGEMENT QUERIES (Owner) =====

// Get My Venues (Owner)
export const useGetMyVenues = () =>
  useQuery({
    queryKey: venueKeys.myVenues(),
    queryFn: () => venuesApi.getMyVenues(),
    staleTime: 5 * 60 * 1000,
  });

// Get My Venue by ID (Owner)
export const useGetMyVenueById = (venueId: string) =>
  useQuery({
    queryKey: venueKeys.detail(venueId),
    queryFn: () => venuesApi.getMyVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

// Get Venue Slots (Owner)
export const useGetVenueSlots = (venueId: string) =>
  useQuery({
    queryKey: venueKeys.slots(venueId),
    queryFn: () => venuesApi.getVenueSlots(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

// Get Venue Bookings (Owner)
export const useGetVenueBookings = (venueId: string) =>
  useQuery({
    queryKey: venueKeys.bookings(venueId),
    queryFn: () => venuesApi.getVenueBookings(venueId),
    enabled: !!venueId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for bookings)
  });

// ===== VENUE MANAGEMENT MUTATIONS (Owner) =====

// Create Venue (Owner)
export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VenueCreate) => venuesApi.createVenue(data),
    onSuccess: () => {
      // Invalidate my venues list to refetch
      queryClient.invalidateQueries({ queryKey: venueKeys.myVenues() });
      // Invalidate public venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

// Update Venue (Owner)
export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: VenueUpdate }) =>
      venuesApi.updateVenue(venueId, data),
    onSuccess: (updatedVenue, { venueId }) => {
      // Update the specific venue in cache
      queryClient.setQueryData(venueKeys.detail(venueId), updatedVenue);
      // Invalidate my venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.myVenues() });
      // Invalidate public venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

// Delete Venue (Owner)
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => venuesApi.deleteVenue(venueId),
    onSuccess: (_, venueId) => {
      // Remove the venue from cache
      queryClient.removeQueries({ queryKey: venueKeys.detail(venueId) });
      // Invalidate my venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.myVenues() });
      // Invalidate public venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

// Update Venue Slots (Owner)
export const useUpdateVenueSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, slots }: { venueId: string; slots: any }) =>
      venuesApi.updateVenueSlots(venueId, slots),
    onSuccess: (_, { venueId }) => {
      // Invalidate venue slots
      queryClient.invalidateQueries({ queryKey: venueKeys.slots(venueId) });
      // Invalidate venue detail
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(venueId) });
    },
  });
};

// Approve Booking (Owner)
export const useApproveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => venuesApi.approveBooking(bookingId),
    onSuccess: booking => {
      // Invalidate venue bookings to refetch
      if (booking.venueId) {
        queryClient.invalidateQueries({
          queryKey: venueKeys.bookings(booking.venueId),
        });
      }
    },
  });
};

// Reject Booking (Owner)
export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      venuesApi.rejectBooking(bookingId, reason),
    onSuccess: booking => {
      // Invalidate venue bookings to refetch
      if (booking.venueId) {
        queryClient.invalidateQueries({
          queryKey: venueKeys.bookings(booking.venueId),
        });
      }
    },
  });
};
