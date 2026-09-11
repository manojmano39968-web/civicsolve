import { ScoredCandidate } from './ranking.js';
import { ExplainableMatchReason } from '@civicsolve/shared';

/**
 * Layer 10: Explainable Match Reasons Generator
 * Generates transparent, human-readable reasons explaining why each provider matched.
 */
export class ExplainableGenerator {
  generateReasons(scored: ScoredCandidate, targetServiceName?: string): ExplainableMatchReason[] {
    const reasons: ExplainableMatchReason[] = [];
    const { candidate, factors } = scored;

    // 1. Service capability match
    const serviceName = targetServiceName || candidate.serviceName;
    reasons.push({
      type: 'EXACT_SERVICE',
      text: `Offers verified ${serviceName} service`,
      positive: true,
      scoreContribution: factors.service,
    });

    // 2. Proximity & Distance
    if (candidate.calculatedDistanceKm !== undefined) {
      reasons.push({
        type: 'DISTANCE',
        text: `${candidate.calculatedDistanceKm} km away from your location`,
        positive: true,
        scoreContribution: factors.distance,
      });

      reasons.push({
        type: 'RADIUS',
        text: `Serves your neighborhood (within declared ${candidate.serviceRadiusKm} km radius)`,
        positive: true,
        scoreContribution: factors.radius,
      });
    } else {
      reasons.push({
        type: 'RADIUS',
        text: `Operating radius: serves up to ${candidate.serviceRadiusKm} km`,
        positive: true,
        scoreContribution: factors.radius,
      });
    }

    // 3. Availability
    if (candidate.availability === 'AVAILABLE') {
      reasons.push({
        type: 'AVAILABILITY',
        text: 'Currently available for new service requests',
        positive: true,
        scoreContribution: factors.availability,
      });
    }

    // 4. Reputation
    if (candidate.reviewCount > 0) {
      reasons.push({
        type: 'RATING',
        text: `${candidate.ratingAvg.toFixed(1)}★ reputation from ${candidate.reviewCount} verified post-resolution reviews`,
        positive: true,
        scoreContribution: factors.reputation,
      });
    }

    // 5. Experience
    if (candidate.experienceYears > 0) {
      reasons.push({
        type: 'EXPERIENCE',
        text: `${candidate.experienceYears} years of declared problem-solving experience`,
        positive: true,
        scoreContribution: factors.experience,
      });
    }

    // 6. Verification
    if (candidate.isVerified) {
      reasons.push({
        type: 'VERIFICATION',
        text: 'CivicSolve verified identity & trade qualification',
        positive: true,
        scoreContribution: factors.verification,
      });
    }

    return reasons;
  }
}
