import {
  SearchUnderstanding as SharedSearchUnderstanding,
  AvailabilityStatus,
  PricingUnit,
} from '@civicsolve/shared';

export type SearchUnderstanding = SharedSearchUnderstanding;

export interface MatchedProvider {
  id: string;
  userId: string;
  fullName: string;
  bio?: string;
  tier?: string;
  isVerified: boolean;
  avatarUrl?: string;
  ratingAverage: number | null;
  ratingCount: number;
  completedRequestsCount: number;
  startingPrice: number;
  pricingUnit: PricingUnit | string;
  pricingDisclaimer: string;
  experienceYears: number;
  serviceRadiusKm: number;
  distanceKm: number;
  availability: AvailabilityStatus;
  serviceName: string;
  serviceCategory: string;
  score: number;
  matchReasons: string[];
}

export interface SearchFilters {
  categoryId?: string;
  serviceId?: string;
  maxDistanceKm?: number;
  minRating?: number;
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
  sortBy?: 'BEST_MATCH' | 'DISTANCE' | 'RATING' | 'PRICE_LOW';
}
