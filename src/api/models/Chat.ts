import { z } from 'zod';

// Chat Room Schema
export const ChatRoomSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(['direct', 'group', 'match', 'tournament', 'team']).default('direct'),
  participants: z.array(z.string()),
  createdBy: z.string().optional(),
  relatedTo: z.object({
    type: z.enum(['match', 'tournament', 'team']).optional(),
    id: z.string().optional(),
  }).optional(),
  lastMessage: z.object({
    content: z.string(),
    sender: z.string(),
    timestamp: z.string(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatRoom = z.infer<typeof ChatRoomSchema>;

// Chat Room Create Schema
export const ChatRoomCreateSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['direct', 'group', 'match', 'tournament', 'team']).optional(),
  participants: z.array(z.string()).min(1),
  relatedTo: z.object({
    type: z.enum(['match', 'tournament', 'team']),
    id: z.string(),
  }).optional(),
});

export type ChatRoomCreate = z.infer<typeof ChatRoomCreateSchema>;

// Chat Message Schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  sender: z.string(),
  content: z.string(),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  replyTo: z.string().optional(),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  readBy: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Chat Message Create Schema
export const ChatMessageCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file', 'system']).optional(),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  replyTo: z.string().optional(),
});

export type ChatMessageCreate = z.infer<typeof ChatMessageCreateSchema>;

// Chat Message Update Schema
export const ChatMessageUpdateSchema = z.object({
  content: z.string().min(1).max(5000),
});

export type ChatMessageUpdate = z.infer<typeof ChatMessageUpdateSchema>;
