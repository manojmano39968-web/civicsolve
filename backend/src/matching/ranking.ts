import { ProviderCandidate } from './filtering.js';

export interface ScoredCandidate {
  candidate: ProviderCandidate;
  totalScore: number; // 0 to 100
  factors: {
    service: number;
    skill: number;
    distance: number;
    radius: number;
    availability: number;
    experience: number;
    reputation: number;
    verification: number;
  };
}

export interface MatchingWeights {
  serviceRelevance: number; // 0.35
  skillMatch: number;       // 0.20
  locationDistance: number; // 0.15
  serviceRadius: number;    // 0.10
  availability: number;     // 0.05
  experience: number;       // 0.05
  reputation: number;       // 0.05
  verification: number;     // 0.05
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  serviceRelevance: 0.35,
  skillMatch: 0.20,
  locationDistance: 0.15,
  serviceRadius: 0.10,
  availability: 0.05,
  experience: 0.05,
  reputation: 0.05,
  verification: 0.05,
};

export class CandidateRanker {
  rankCandidates(
    candidates: ProviderCandidate[],
    queryKeywords: string[],
    targetServiceId?: string,
    weights: MatchingWeights = DEFAULT_WEIGHTS
  ): ScoredCandidate[] {
    const scored: ScoredCandidate[] = candidates.map(c => {
      // 1. Service relevance (1.0 for exact target service match)
      const serviceScore = targetServiceId && c.serviceId === targetServiceId ? 1.0 : 0.7;

      // 2. Skill & Bio token overlap (Jaccard similarity)
      const bioTokens = new Set(
        `${c.professionalTitle} ${c.customTitle || ''} ${c.bio || ''}`
          .toLowerCase()
          .split(/[^a-z0-9]/)
          .filter(t => t.length > 2)
      );

      let matches = 0;
      for (const kw of queryKeywords) {
        if (bioTokens.has(kw)) matches++;
      }
      const skillScore = queryKeywords.length > 0
        ? Math.min(1.0, Math.round((matches / queryKeywords.length) * 100) / 100)
        : 0.5;

      // 3. Distance decay factor
      let distScore = 0.8; // Default if no distance
      if (c.calculatedDistanceKm !== undefined && c.serviceRadiusKm > 0) {
        distScore = Math.max(0, 1.0 - c.calculatedDistanceKm / c.serviceRadiusKm);
      }

      // 4. Radius headroom factor (bonus for being comfortably within radius)
      let radiusScore = 0.8;
      if (c.calculatedDistanceKm !== undefined && c.serviceRadiusKm > 0) {
        if (c.calculatedDistanceKm <= c.serviceRadiusKm * 0.5) {
          radiusScore = 1.0;
        } else if (c.calculatedDistanceKm <= c.serviceRadiusKm) {
          radiusScore = 0.6;
        } else {
          radiusScore = 0.0;
        }
      }

      // 5. Availability factor
      const availScore =
        c.availability === 'AVAILABLE' ? 1.0 : c.availability === 'BUSY' ? 0.4 : 0.0;

      // 6. Experience factor (logarithmic scaling normalized at 10 years)
      const expScore = Math.min(1.0, Math.log(1 + Math.max(0, c.experienceYears)) / Math.log(11));

      // 7. Reputation factor (Bayesian mean with prior of 5.0 and weight m=3)
      const bayesianRating =
        (c.ratingAvg * c.reviewCount + 5.0 * 3) / (c.reviewCount + 3);
      const repScore = Math.min(1.0, bayesianRating / 5.0);

      // 8. Verification factor
      const verifScore = c.isVerified ? 1.0 : 0.2;

      // Calculate total weighted score [0 to 100]
      const rawScore =
        serviceScore * weights.serviceRelevance +
        skillScore * weights.skillMatch +
        distScore * weights.locationDistance +
        radiusScore * weights.serviceRadius +
        availScore * weights.availability +
        expScore * weights.experience +
        repScore * weights.reputation +
        verifScore * weights.verification;

      const totalScore = Math.min(99, Math.max(20, Math.round(rawScore * 100)));

      return {
        candidate: c,
        totalScore,
        factors: {
          service: serviceScore,
          skill: skillScore,
          distance: distScore,
          radius: radiusScore,
          availability: availScore,
          experience: expScore,
          reputation: repScore,
          verification: verifScore,
        },
      };
    });

    // Deterministic Tie-Breaking Sort:
    // 1. Total Score DESC
    // 2. Rating Avg DESC
    // 3. Review Count DESC
    // 4. Provider ID ASC
    return scored.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.candidate.ratingAvg !== a.candidate.ratingAvg) return b.candidate.ratingAvg - a.candidate.ratingAvg;
      if (b.candidate.reviewCount !== a.candidate.reviewCount) return b.candidate.reviewCount - a.candidate.reviewCount;
      return a.candidate.id.localeCompare(b.candidate.id);
    });
  }
}
