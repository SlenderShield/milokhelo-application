import { z } from 'zod';

// Event Schema
export const EventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['match', 'tournament', 'training', 'meeting', 'other']).optional(),
  relatedTo: z.object({
    type: z.enum(['match', 'tournament']).optional(),
    id: z.string().optional(),
  }).optional(),
  color: z.string().optional(),
  isAllDay: z.boolean().default(false),
  reminder: z.number().optional(),
  recurrence: z.string().optional(),
  syncedWithGoogle: z.boolean().default(false),
  syncedWithMobile: z.boolean().default(false),
  googleEventId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Event = z.infer<typeof EventSchema>;

// Event Create Schema
export const EventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['match', 'tournament', 'training', 'meeting', 'other']).optional(),
  relatedTo: z.object({
    type: z.enum(['match', 'tournament']),
    id: z.string(),
  }).optional(),
  color: z.string().optional(),
  isAllDay: z.boolean().optional(),
  reminder: z.number().optional(),
  recurrence: z.string().optional(),
});

export type EventCreate = z.infer<typeof EventCreateSchema>;

// Event Sync Schema
export const EventSyncSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  relatedTo: z.object({
    type: z.enum(['match', 'tournament']),
    id: z.string(),
  }),
  syncedWithMobile: z.boolean(),
});

export type EventSync = z.infer<typeof EventSyncSchema>;
