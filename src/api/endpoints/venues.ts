import { apiClient } from '../client';
import {
  Venue,
  VenueSchema,
  VenueCreate,
  VenueUpdate,
  Booking,
  BookingSchema,
  BookingCreate,
  SlotAvailability,
  SlotAvailabilitySchema,
  PaginationQuery,
  SearchQuery,
} from '../models';

// ===== PUBLIC VENUE ENDPOINTS =====

// Get Venues (List)
export const getVenues = (params?: PaginationQuery) =>
  apiClient.get<Venue[]>('/venues', { params }).then(res => VenueSchema.array().parse(res.data));

// Search Venues
export const searchVenues = (params: SearchQuery) =>
  apiClient
    .get<Venue[]>('/venues/search', { params })
    .then(res => VenueSchema.array().parse(res.data));

// Get Nearby Venues
export const getNearbyVenues = (params: {
  lat: number;
  lng: number;
  radius?: number;
  sport?: string;
  available?: boolean;
}) =>
  apiClient
    .get<Venue[]>('/venues/nearby', { params })
    .then(res => VenueSchema.array().parse(res.data));

// Get Venue by ID
export const getVenueById = (venueId: string) =>
  apiClient.get<Venue>(`/venues/${venueId}`).then(res => VenueSchema.parse(res.data));

// Get Venue Availability
export const getVenueAvailability = (venueId: string, date: string) =>
  apiClient
    .get<SlotAvailability>(`/venues/${venueId}/availability`, { params: { date } })
    .then(res => SlotAvailabilitySchema.parse(res.data));

// Book Venue Slot
export const bookVenueSlot = (venueId: string, data: BookingCreate) =>
  apiClient
    .post<Booking>(`/venues/${venueId}/book`, data)
    .then(res => BookingSchema.parse(res.data));

// ===== VENUE MANAGEMENT ENDPOINTS (Owner) =====

// Get My Venues (Owner)
export const getMyVenues = () =>
  apiClient
    .get<Venue[]>('/venue-management/venues')
    .then(res => VenueSchema.array().parse(res.data));

// Create Venue (Owner)
export const createVenue = (data: VenueCreate) =>
  apiClient.post<Venue>('/venue-management/venues', data).then(res => VenueSchema.parse(res.data));

// Get Venue Detail (Owner)
export const getMyVenueById = (venueId: string) =>
  apiClient
    .get<Venue>(`/venue-management/venues/${venueId}`)
    .then(res => VenueSchema.parse(res.data));

// Update Venue (Owner)
export const updateVenue = (venueId: string, data: VenueUpdate) =>
  apiClient
    .patch<Venue>(`/venue-management/venues/${venueId}`, data)
    .then(res => VenueSchema.parse(res.data));

// Delete Venue (Owner)
export const deleteVenue = (venueId: string) =>
  apiClient.delete(`/venue-management/venues/${venueId}`).then(res => res.data);

// Get Venue Slots (Owner)
export const getVenueSlots = (venueId: string) =>
  apiClient.get<any>(`/venue-management/venues/${venueId}/slots`).then(res => res.data);

// Add/Update Venue Slots (Owner)
export const updateVenueSlots = (venueId: string, slots: any) =>
  apiClient.post<any>(`/venue-management/venues/${venueId}/slots`, { slots }).then(res => res.data);

// Get Venue Bookings (Owner)
export const getVenueBookings = (venueId: string) =>
  apiClient
    .get<Booking[]>(`/venue-management/venues/${venueId}/bookings`)
    .then(res => BookingSchema.array().parse(res.data));

// Approve Booking (Owner)
export const approveBooking = (bookingId: string) =>
  apiClient
    .post<Booking>(`/venue-management/bookings/${bookingId}/approve`)
    .then(res => BookingSchema.parse(res.data));

// Reject Booking (Owner)
export const rejectBooking = (bookingId: string, reason?: string) =>
  apiClient
    .post<Booking>(`/venue-management/bookings/${bookingId}/reject`, { reason })
    .then(res => BookingSchema.parse(res.data));
