import { z } from 'zod';

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'match_invitation',
    'tournament_invitation',
    'team_invitation',
    'friend_request',
    'match_update',
    'tournament_update',
    'message',
    'achievement',
    'system',
  ]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  isRead: z.boolean().default(false),
  actionUrl: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Device Token Register Schema
export const DeviceTokenRegisterSchema = z.object({
  token: z.string().min(10).max(500),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

export type DeviceTokenRegister = z.infer<typeof DeviceTokenRegisterSchema>;

// Invitation Schema
export const InvitationSchema = z.object({
  id: z.string(),
  sender: z.string(),
  recipient: z.string(),
  type: z.enum(['match', 'tournament', 'team', 'friend']),
  entityId: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'declined']).default('pending'),
  message: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Invitation = z.infer<typeof InvitationSchema>;

// Invitation Create Schema
export const InvitationCreateSchema = z.object({
  recipientId: z.string(),
  type: z.enum(['match', 'tournament', 'team', 'friend']),
  entityId: z.string().optional(),
  message: z.string().max(500).optional(),
});

export type InvitationCreate = z.infer<typeof InvitationCreateSchema>;

// Invitation Response Schema
export const InvitationResponseSchema = z.object({
  response: z.enum(['accept', 'decline']),
});

export type InvitationResponse = z.infer<typeof InvitationResponseSchema>;
