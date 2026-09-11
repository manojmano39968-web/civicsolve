export type ProviderType = 
  | 'INDIVIDUAL' 
  | 'FREELANCER' 
  | 'BUSINESS' 
  | 'STUDENT' 
  | 'FACULTY' 
  | 'TECH_CLUB';

export type ServiceMode = 'HOME_VISIT' | 'SERVICE_CENTER' | 'BOTH';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type PricingUnit = 
  | 'PER_SERVICE' 
  | 'PER_HOUR' 
  | 'PER_DAY' 
  | 'PER_SQFT' 
  | 'PER_ITEM' 
  | 'PER_KM' 
  | 'CUSTOM';

export interface ProviderLocation {
  id: string;
  providerId: string;
  latitude: number;
  longitude: number;
  addressLine?: string | null;
  area: string;
  city: string;
  pincode?: string | null;
  isPublic: boolean;
}

export interface ServicePricing {
  id: string;
  providerServiceId: string;
  startingPrice?: number | null;
  typicalMin?: number | null;
  typicalMax?: number | null;
  pricingUnit: PricingUnit;
  pricingNotes?: string | null;
}

export interface ProviderServiceOffered {
  id: string;
  providerId: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  customTitle?: string | null;
  customDescription?: string | null;
  isActive: boolean;
  pricing?: ServicePricing | null;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  providerType: ProviderType;
  businessName?: string | null;
  professionalTitle: string;
  bio?: string | null;
  experienceYears: number;
  serviceMode: ServiceMode;
  serviceRadiusKm: number;
  isVerified: boolean;
  verificationBadge?: string | null;
  ratingAvg: number;
  reviewCount: number;
  availability: AvailabilityStatus;
  statusNote?: string | null;
  location?: ProviderLocation | null;
  services?: ProviderServiceOffered[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderPublicSummary {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  providerType: ProviderType;
  businessName?: string | null;
  professionalTitle: string;
  bio?: string | null;
  experienceYears: number;
  serviceMode: ServiceMode;
  serviceRadiusKm: number;
  isVerified: boolean;
  ratingAvg: number;
  reviewCount: number;
  availability: AvailabilityStatus;
  area: string;
  city: string;
  calculatedDistanceKm?: number;
  publicAddress?: string | null; // only present if business with public location
  services: {
    serviceId: string;
    name: string;
    startingPrice?: number | null;
    typicalMin?: number | null;
    typicalMax?: number | null;
    pricingUnit: PricingUnit;
  }[];
}
