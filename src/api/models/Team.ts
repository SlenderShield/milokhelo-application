import { z } from 'zod';

// Team Schema
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  sport: z.string(),
  description: z.string().optional(),
  avatar: z.string().url().optional(),
  captain: z.string(),
  members: z.array(z.string()),
  maxMembers: z.number().optional(),
  isPrivate: z.boolean().default(false),
  joinCode: z.string().optional(),
  stats: z.object({
    matchesPlayed: z.number().default(0),
    wins: z.number().default(0),
    losses: z.number().default(0),
    draws: z.number().default(0),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Team = z.infer<typeof TeamSchema>;

// Team Create Schema
export const TeamCreateSchema = z.object({
  name: z.string().min(3).max(50),
  sport: z.string(),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  maxMembers: z.number().min(2).optional(),
  isPrivate: z.boolean().optional(),
  joinCode: z.string().optional(),
});

export type TeamCreate = z.infer<typeof TeamCreateSchema>;

// Team Update Schema
export const TeamUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  captain: z.string().optional(),
  maxMembers: z.number().min(2).optional(),
  isPrivate: z.boolean().optional(),
  joinCode: z.string().optional(),
});

export type TeamUpdate = z.infer<typeof TeamUpdateSchema>;

// Team Join Schema
export const TeamJoinSchema = z.object({
  joinCode: z.string().optional(),
});

export type TeamJoin = z.infer<typeof TeamJoinSchema>;
