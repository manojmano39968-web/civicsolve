import { z } from 'zod';

export const understandQuerySchema = z.object({
  q: z
    .string({ required_error: 'Search query parameter "q" is required.' })
    .trim()
    .min(1, 'Search query cannot be empty.')
    .max(300, 'Search query cannot exceed 300 characters.'),
});

export const searchProvidersSchema = z.object({
  query: z.string().max(300, 'Search query cannot exceed 300 characters.').optional(),
  serviceId: z.string().max(100).optional(),
  categoryId: z.string().max(100).optional(),
  categorySlug: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90.').optional(),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180.').optional(),
  maxDistanceKm: z.number().min(0.1).max(200, 'Search radius cannot exceed 200 km.').optional(),
  minRating: z.number().min(1).max(5, 'Minimum rating must be between 1 and 5.').optional(),
  serviceMode: z.enum(['HOME_VISIT', 'SERVICE_CENTER', 'BOTH']).optional(),
  onlyAvailable: z.boolean().optional(),
  onlyVerified: z.boolean().optional(),
  page: z.number().int().min(1, 'Page must be at least 1.').optional(),
  limit: z.number().int().min(1).max(50, 'Limit cannot exceed 50 per page.').optional(),
});

export type UnderstandQueryInput = z.infer<typeof understandQuerySchema>;
export type SearchProvidersInput = z.infer<typeof searchProvidersSchema>;
