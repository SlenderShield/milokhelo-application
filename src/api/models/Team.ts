import { z } from 'zod';

// Team Member Schema
export const TeamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['captain', 'member']).default('member'),
  joinedAt: z.string(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Team Schema
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  sport: z.string(),
  description: z.string().optional(),
  avatar: z.string().url().optional(),
  captain: z.string().optional(), // Kept for backwards compatibility
  captainId: z.string().optional(), // Backend uses captainId
  members: z.array(
    z.union([
      z.string(), // For backwards compatibility
      TeamMemberSchema, // Backend format
    ])
  ),
  maxMembers: z.number().optional(),
  isPrivate: z.boolean().default(false),
  joinCode: z.string().optional(),
  stats: z
    .object({
      matchesPlayed: z.number().default(0),
      wins: z.number().default(0),
      losses: z.number().default(0),
      draws: z.number().default(0),
      rating: z.number().optional(),
      elo: z.number().optional(),
    })
    .optional(),
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
