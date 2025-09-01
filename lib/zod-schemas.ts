import { z } from 'zod'

// Pagination schema
export const PaginationSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// User update schema
export const UpdateMeSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  timeZone: z.string().optional(),
})

// Source (subreddit) schema
export const AddSourceSchema = z.object({
  name: z.string().min(1).max(50).transform(s => s.toLowerCase()),
  priority: z.number().int().min(0).max(10).default(0),
})

// Schedule policy schema
export const ScheduleUpsertSchema = z.object({
  timeZone: z.string().default('UTC'),
  postsPerDay: z.number().int().min(1).max(10).default(1),
  preferredTimes: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).default([]),
  daysOfWeek: z.array(z.enum(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])).optional(),
  windowStart: z.number().int().min(0).max(23).nullable().optional(),
  windowEnd: z.number().int().min(0).max(23).nullable().optional(),
  isActive: z.boolean().default(true),
})

// Draft status filter
export const DraftStatusFilterSchema = z.object({
  status: z.enum(['DRAFT', 'APPROVED', 'REJECTED', 'SCHEDULED', 'POSTED']).optional(),
})

// Post status filter
export const PostStatusFilterSchema = z.object({
  status: z.enum(['SCHEDULED', 'POSTED', 'FAILED', 'CANCELED', 'SKIPPED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

// Cancel post schema
export const CancelPostSchema = z.object({
  reason: z.string().max(500).optional(),
})

// ID parameter schema
export const IdParamSchema = z.object({
  id: z.string().cuid(),
})

// Date range schema
export const DateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

// Reorder sources schema
export const ReorderSourcesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid(),
      priority: z.number().int(),
    })
  ).min(1).max(200).refine(
    (items) => {
      const ids = items.map(item => item.id)
      return new Set(ids).size === ids.length
    },
    {
      message: 'All IDs must be unique',
    }
  ),
})
