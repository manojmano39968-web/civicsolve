import { Service } from '@civicsolve/shared';
import { DetectedPhrase } from './phrases.js';

/**
 * Layer 7: Service Resolution & Ambiguity Clarification Gate
 * Resolves candidate services, computes confidence scores, and detects ambiguous queries.
 */

export interface ServiceMatchResult {
  service: Service;
  score: number;
  confidence: number;
  matchedReason: string;
}

export interface ServiceResolutionResult {
  topMatches: ServiceMatchResult[];
  needsClarification: boolean;
  clarificationPrompt?: string;
  clarificationOptions?: {
    serviceId: string;
    name: string;
    category: string;
  }[];
}

export function resolveServices(
  normalizedQuery: string,
  keywords: string[],
  detectedPhrases: DetectedPhrase[],
  conceptScores: Map<string, number>,
  allServices: Service[]
): ServiceResolutionResult {
  const scoredServices = new Map<string, { service: Service; score: number; reason: string }>();

  for (const svc of allServices) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Exact service name / slug match
    if (normalizedQuery === svc.name.toLowerCase() || normalizedQuery === svc.slug) {
      score += 10.0;
      reasons.push('exact service match');
    } else if (normalizedQuery.includes(svc.name.toLowerCase())) {
      score += 5.0;
      reasons.push(`query contains '${svc.name}'`);
    }

    // 2. Detected phrase match
    for (const dp of detectedPhrases) {
      if (dp.serviceHint === svc.slug) {
        score += 6.0;
        reasons.push(`matches problem phrase '${dp.phrase}'`);
      }
    }

    // 3. Database alias match
    for (const alias of svc.aliases || []) {
      const aliasLower = alias.toLowerCase();
      if (normalizedQuery === aliasLower) {
        score += 8.0;
        reasons.push(`exact alias match '${alias}'`);
      } else if (normalizedQuery.includes(aliasLower)) {
        score += 4.0;
        reasons.push(`query contains alias '${alias}'`);
      }
    }

    // 4. Synonym concept expansion score
    const conceptScore = conceptScores.get(svc.slug) || 0;
    if (conceptScore > 0) {
      score += conceptScore * 2.5;
      reasons.push('vernacular keyword concept mapping');
    }

    // 5. Keyword token overlap
    for (const kw of keywords) {
      if (svc.slug.includes(kw) || svc.name.toLowerCase().includes(kw)) {
        score += 1.5;
        reasons.push(`keyword '${kw}' overlap`);
      }
    }

    if (score > 0) {
      scoredServices.set(svc.id, {
        service: svc,
        score,
        reason: reasons[0] || 'relevance match',
      });
    }
  }

  // Sort by score descending
  const candidates = Array.from(scoredServices.values()).sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      topMatches: [],
      needsClarification: false,
    };
  }

  const highestScore = candidates[0].score;
  const topMatches: ServiceMatchResult[] = candidates.slice(0, 5).map(c => ({
    service: c.service,
    score: c.score,
    confidence: Math.min(1.0, Math.round((c.score / Math.max(highestScore, 8.0)) * 100) / 100),
    matchedReason: c.reason,
  }));

  // Ambiguity Detection Gate:
  // Check if multiple services have high, nearly equal scores (within 20% of top score)
  // unless the query was an explicit exact name or alias match for the top service.
  let needsClarification = false;
  let clarificationPrompt: string | undefined;
  let clarificationOptions: ServiceResolutionResult['clarificationOptions'];

  if (topMatches.length >= 2) {
    const first = topMatches[0];
    const second = topMatches[1];

    const isExactTopMatch = first.matchedReason.includes('exact service match') || first.matchedReason.includes('exact alias match');

    if (second.score >= first.score * 0.80 && !isExactTopMatch) {
      needsClarification = true;
      clarificationPrompt = `We found multiple possible services for "${normalizedQuery}". Which specific service do you need?`;
      clarificationOptions = topMatches.slice(0, 3).map(m => ({
        serviceId: m.service.id,
        name: m.service.name,
        category: m.service.categoryName || 'General',
      }));
    }
  }

  return {
    topMatches,
    needsClarification,
    clarificationPrompt,
    clarificationOptions,
  };
}
