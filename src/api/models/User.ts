import { z } from 'zod';

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  sportsPreferences: z.array(z.string()).optional(),
  skillLevels: z.record(z.string(), z.string()).optional(),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['guest', 'user', 'venue_owner', 'moderator', 'admin', 'superadmin']).default('user'),
  isEmailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  friends: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// User Create Schema
export const UserCreateSchema = z.object({
  username: z.string().min(3).max(30),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

// User Update Schema
export const UserUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  name: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  sportsPreferences: z.array(z.string()).optional(),
  skillLevels: z.record(z.string(), z.string()).optional(),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

// User Stats Schema
export const UserStatSchema = z.object({
  userId: z.string(),
  sport: z.string(),
  matchesPlayed: z.number().default(0),
  wins: z.number().default(0),
  losses: z.number().default(0),
  draws: z.number().default(0),
  goalsScored: z.number().default(0),
  assists: z.number().default(0),
  cleanSheets: z.number().default(0),
  yellowCards: z.number().default(0),
  redCards: z.number().default(0),
  rating: z.number().default(1000),
  winStreak: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  rank: z.number().optional(),
  lastPlayed: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserStat = z.infer<typeof UserStatSchema>;

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  category: z.enum(['milestone', 'skill', 'social', 'special']),
  criteria: z.record(z.string(), z.any()),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  points: z.number(),
  unlockedAt: z.string().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
