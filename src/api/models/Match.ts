import { z } from 'zod';

// Location Schema
export const LocationSchema = z.object({
  venue: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// Match Schema
export const MatchSchema = z.object({
  id: z.string(),
  title: z.string(),
  sport: z.string(),
  type: z.enum(['friendly', 'competitive', 'tournament']).default('friendly'),
  startAt: z.string(),
  endAt: z.string().optional(),
  location: LocationSchema,
  organizer: z.string(),
  participants: z.array(z.string()),
  maxParticipants: z.number().optional(),
  minParticipants: z.number().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']).default('scheduled'),
  scores: z.record(z.any()).optional(),
  performanceMetrics: z.array(z.object({
    userId: z.string(),
    goals: z.number().optional(),
    assists: z.number().optional(),
    fouls: z.number().optional(),
    yellowCards: z.number().optional(),
    redCards: z.number().optional(),
  })).optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  isPrivate: z.boolean().default(false),
  cancelReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Match = z.infer<typeof MatchSchema>;

// Match Create Schema
export const MatchCreateSchema = z.object({
  title: z.string().min(3).max(100),
  sport: z.string(),
  type: z.enum(['friendly', 'competitive', 'tournament']).optional(),
  startAt: z.string(),
  endAt: z.string().optional(),
  location: LocationSchema,
  maxParticipants: z.number().min(2).optional(),
  minParticipants: z.number().min(2).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).optional(),
  description: z.string().max(1000).optional(),
  rules: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export type MatchCreate = z.infer<typeof MatchCreateSchema>;

// Match Update Schema
export const MatchUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  location: LocationSchema.optional(),
  maxParticipants: z.number().min(2).optional(),
  minParticipants: z.number().min(2).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).optional(),
  description: z.string().max(1000).optional(),
  rules: z.string().optional(),
  isPrivate: z.boolean().optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']).optional(),
  cancelReason: z.string().optional(),
});

export type MatchUpdate = z.infer<typeof MatchUpdateSchema>;

// Match Result Schema
export const MatchResultSchema = z.object({
  scores: z.record(z.any()),
  performanceMetrics: z.array(z.object({
    userId: z.string(),
    goals: z.number().optional(),
    assists: z.number().optional(),
    fouls: z.number().optional(),
    yellowCards: z.number().optional(),
    redCards: z.number().optional(),
  })).optional(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

// Match Status Update Schema
export const MatchStatusUpdateSchema = z.object({
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']),
});

export type MatchStatusUpdate = z.infer<typeof MatchStatusUpdateSchema>;
