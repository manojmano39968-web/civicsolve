import { z } from 'zod';

export const servicePricingInputSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  customTitle: z.string().max(120).optional(),
  customDescription: z.string().max(1000).optional(),
  startingPrice: z.number().min(0, 'Starting price must be non-negative').optional(),
  typicalMin: z.number().min(0, 'Minimum price must be non-negative').optional(),
  typicalMax: z.number().min(0, 'Maximum price must be non-negative').optional(),
  pricingUnit: z.enum([
    'PER_SERVICE',
    'PER_HOUR',
    'PER_DAY',
    'PER_SQFT',
    'PER_ITEM',
    'PER_KM',
    'CUSTOM',
  ]),
  pricingNotes: z.string().max(500).optional(),
}).refine(
  data => {
    if (data.typicalMin !== undefined && data.typicalMax !== undefined) {
      return data.typicalMin <= data.typicalMax;
    }
    return true;
  },
  {
    message: 'Typical minimum price cannot exceed maximum price',
    path: ['typicalMax'],
  }
);

export const providerOnboardingSchema = z.object({
  providerType: z.enum([
    'INDIVIDUAL',
    'FREELANCER',
    'BUSINESS',
    'STUDENT',
    'FACULTY',
    'TECH_CLUB',
  ]),
  businessName: z.string().max(150).optional(),
  professionalTitle: z.string().min(2, 'Professional title is required').max(120),
  bio: z.string().max(2000).optional(),
  experienceYears: z.number().min(0, 'Experience years must be >= 0').max(60),
  serviceMode: z.enum(['HOME_VISIT', 'SERVICE_CENTER', 'BOTH']),
  serviceRadiusKm: z.number().min(1).max(100),
  availability: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']),
  statusNote: z.string().max(255).optional(),
  
  // Location
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressLine: z.string().min(3, 'Address line is required'),
  area: z.string().min(2, 'Area/neighborhood is required').max(100),
  city: z.string().min(2, 'City is required').max(80),
  pincode: z.string().max(20).optional(),

  // Services offered
  services: z.array(servicePricingInputSchema).min(1, 'Please select at least one service offered'),
});

export const updateAvailabilitySchema = z.object({
  status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']),
  statusNote: z.string().max(255).optional(),
});

export type ProviderOnboardingInput = z.infer<typeof providerOnboardingSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
