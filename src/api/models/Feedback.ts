import { z } from 'zod';

// Feedback Schema
export const FeedbackSchema = z.object({
  id: z.string(),
  user: z.string(),
  type: z.enum(['bug', 'feature', 'improvement', 'complaint', 'other']),
  category: z.string().optional(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['new', 'under_review', 'resolved', 'closed']).default('new'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  attachments: z.array(z.string().url()).optional(),
  response: z.string().optional(),
  respondedBy: z.string().optional(),
  respondedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

// Feedback Create Schema
export const FeedbackCreateSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'complaint', 'other']),
  category: z.string().optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
  attachments: z.array(z.string().url()).optional(),
});

export type FeedbackCreate = z.infer<typeof FeedbackCreateSchema>;
