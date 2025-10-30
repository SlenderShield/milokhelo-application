import { z } from 'zod';

// Common Response Schemas
export const ApiErrorSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string(),
        value: z.any().optional(),
      })
    )
    .optional(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiSuccessSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ApiSuccess = z.infer<typeof ApiSuccessSchema>;

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });

// Query Params
export const PaginationQuerySchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  skip: z.number().min(0).default(0).optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
  sport: z.string().optional(),
  city: z.string().optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
