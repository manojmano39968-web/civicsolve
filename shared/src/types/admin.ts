export interface PlatformMetrics {
  totalUsers: number;
  totalNeeders: number;
  totalProviders: number;
  verifiedProviders: number;
  totalRequests: number;
  completedRequests: number;
  totalReviews: number;
  averageRating: number;
  unmetRequirementsCount: number;
}

export interface VerificationAttestation {
  id: string;
  providerId: string;
  providerName: string;
  providerTitle: string;
  attestationType: 'CAMPUS_EMAIL' | 'BUSINESS_REG' | 'PORTFOLIO_LINK';
  referenceData: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedByAdminId?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface MatchingConfiguration {
  id: string;
  key: string;
  weight: number;
  description: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  detailsJson?: string | null;
  createdAt: string;
}
