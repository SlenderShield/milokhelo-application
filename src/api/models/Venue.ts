import { z } from 'zod';

// GeoLocation Schema
export const GeoLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

export type GeoLocation = z.infer<typeof GeoLocationSchema>;

// Venue Schema
export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string().optional(),
  location: GeoLocationSchema,
  sportsSupported: z.array(z.string()),
  facilities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().optional(),
  owner: z.string(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  isAvailable: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Venue = z.infer<typeof VenueSchema>;

// Venue Create Schema
export const VenueCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string().optional(),
  location: GeoLocationSchema,
  sportsSupported: z.array(z.string()).min(1),
  facilities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
});

export type VenueCreate = z.infer<typeof VenueCreateSchema>;

// Venue Update Schema
export const VenueUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  sportsSupported: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  isAvailable: z.boolean().optional(),
});

export type VenueUpdate = z.infer<typeof VenueUpdateSchema>;

// Slot Availability Schema
export const SlotAvailabilitySchema = z.object({
  date: z.string(),
  slots: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean(),
    price: z.number(),
  })),
});

export type SlotAvailability = z.infer<typeof SlotAvailabilitySchema>;

// Booking Schema
export const BookingSchema = z.object({
  id: z.string(),
  venue: z.string(),
  user: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  sport: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  totalPrice: z.number(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Booking = z.infer<typeof BookingSchema>;

// Booking Create Schema
export const BookingCreateSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  sport: z.string(),
  notes: z.string().max(500).optional(),
});

export type BookingCreate = z.infer<typeof BookingCreateSchema>;

// Map Submission Schema
export const MapSubmissionSchema = z.object({
  entityType: z.enum(['match', 'tournament']),
  entityId: z.string(),
  name: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export type MapSubmission = z.infer<typeof MapSubmissionSchema>;
