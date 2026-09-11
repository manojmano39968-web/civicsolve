import { ProviderPublicSummary } from './provider.js';

export type SearchIntent = 
  | 'SERVICE_SEARCH' 
  | 'PROBLEM_REPORT' 
  | 'SKILL_SEARCH' 
  | 'COLLEGE_HELP' 
  | 'REPAIR_REQUEST';

export interface SearchUnderstanding {
  query: string;
  normalizedQuery: string;
  intent: SearchIntent;
  confidence: number;
  detectedCategories: {
    slug: string;
    name: string;
    confidence: number;
  }[];
  detectedServices: {
    id: string;
    slug: string;
    name: string;
    categoryName: string;
    confidence: number;
  }[];
  extractedKeywords: string[];
  detectedPhrases: string[];
  needsClarification: boolean;
  clarificationPrompt?: string;
  clarificationOptions?: {
    serviceId: string;
    name: string;
    category: string;
  }[];
}

export interface ExplainableMatchReason {
  type: 
    | 'EXACT_SERVICE' 
    | 'CATEGORY_MATCH' 
    | 'SKILL_KEYWORD' 
    | 'DISTANCE' 
    | 'RADIUS' 
    | 'AVAILABILITY' 
    | 'EXPERIENCE' 
    | 'RATING' 
    | 'VERIFICATION';
  text: string;
  positive: boolean;
  scoreContribution: number;
}

export interface MatchedProviderResult extends ProviderPublicSummary {
  matchScore: number; // 0 to 100
  explainableReasons: ExplainableMatchReason[];
}

export interface SearchFilterParams {
  query?: string;
  serviceId?: string;
  categorySlug?: string;
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
  minRating?: number;
  serviceMode?: 'HOME_VISIT' | 'SERVICE_CENTER' | 'BOTH';
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
