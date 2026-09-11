import { normalizeText } from './normalizer.js';
import { extractKeywords } from './keywords.js';
import { detectPhrases } from './phrases.js';
import { expandConcepts } from './synonyms.js';
import { detectIntent } from './intent.js';
import { classifyCategories } from './classifier.js';
import { resolveServices } from './serviceMapper.js';
import { CandidateFilter } from '../matching/filtering.js';
import { CandidateRanker } from '../matching/ranking.js';
import { ExplainableGenerator } from '../matching/explainable.js';
import { TaxonomyRepository } from '../repositories/taxonomy.repository.js';
import {
  SearchUnderstanding,
  MatchedProviderResult,
  SearchFilterParams,
  PricingUnit,
} from '@civicsolve/shared';

export class CivicSolveIntelligenceEngine {
  private taxonomyRepo = new TaxonomyRepository();
  private candidateFilter = new CandidateFilter();
  private candidateRanker = new CandidateRanker();
  private explainableGen = new ExplainableGenerator();

  /**
   * Understands a natural language query using Layers 1-7
   */
  async understand(rawQuery: string): Promise<SearchUnderstanding> {
    // Layer 1: Normalization
    const normalizedQuery = normalizeText(rawQuery);

    // Layer 2: Keyword Extraction & N-Grams
    const { meaningfulKeywords, ngrams } = extractKeywords(normalizedQuery);

    // Layer 3: Phrase Detection
    const detectedPhrases = detectPhrases(normalizedQuery, ngrams);

    // Layer 4: Synonym & Concept Expansion
    const conceptScores = expandConcepts(meaningfulKeywords);

    // Layer 5: Intent Detection
    const intent = detectIntent(normalizedQuery);

    // Fetch active services for resolution
    const allServices = await this.taxonomyRepo.getServices();

    // Layer 7: Service Resolution & Ambiguity Gate
    const { topMatches, needsClarification, clarificationPrompt, clarificationOptions } =
      resolveServices(normalizedQuery, meaningfulKeywords, detectedPhrases, conceptScores, allServices);

    // Layer 6: Category Classification
    const detectedCategories = classifyCategories(topMatches);

    const overallConfidence = topMatches.length > 0 ? topMatches[0].confidence : 0;

    return {
      query: rawQuery,
      normalizedQuery,
      intent,
      confidence: overallConfidence,
      detectedCategories,
      detectedServices: topMatches.map(m => ({
        id: m.service.id,
        slug: m.service.slug,
        name: m.service.name,
        categoryName: m.service.categoryName || 'General',
        confidence: m.confidence,
      })),
      extractedKeywords: meaningfulKeywords,
      detectedPhrases: detectedPhrases.map(p => p.phrase),
      needsClarification,
      clarificationPrompt,
      clarificationOptions,
    };
  }

  /**
   * Executes full search & matching pipeline using Layers 8-10
   */
  async matchProviders(filters: SearchFilterParams): Promise<{
    providers: MatchedProviderResult[];
    understanding?: SearchUnderstanding;
    total: number;
  }> {
    let understanding: SearchUnderstanding | undefined;
    const targetServiceIds: string[] = [];

    // 1. If natural language query provided, understand requirement first
    if (filters.query && filters.query.trim()) {
      understanding = await this.understand(filters.query);
      for (const s of understanding.detectedServices) {
        targetServiceIds.push(s.id);
      }
    }

    // Explicit serviceId filter override
    if (filters.serviceId) {
      if (!targetServiceIds.includes(filters.serviceId)) {
        targetServiceIds.unshift(filters.serviceId);
      }
    }

    // 2. Layer 8: Candidate Generation & Hard Eligibility Filtering
    const candidates = await this.candidateFilter.findEligibleCandidates(
      targetServiceIds,
      filters
    );

    if (candidates.length === 0) {
      return {
        providers: [],
        understanding,
        total: 0,
      };
    }

    // 3. Layer 9: Multi-Factor Weighted Scoring & Tie-Breaking
    const primaryServiceId = targetServiceIds[0];
    const scoredCandidates = this.candidateRanker.rankCandidates(
      candidates,
      understanding?.extractedKeywords || [],
      primaryServiceId
    );

    // Group duplicate provider rows (a provider can offer multiple matching services)
    const providerMap = new Map<string, MatchedProviderResult>();

    for (const sc of scoredCandidates) {
      const { candidate, totalScore } = sc;
      const existing = providerMap.get(candidate.id);

      // Layer 10: Generate Explainable Match Reasons
      const reasons = this.explainableGen.generateReasons(
        sc,
        understanding?.detectedServices[0]?.name
      );

      const serviceSummary = {
        serviceId: candidate.serviceId,
        name: candidate.serviceName,
        startingPrice: candidate.startingPrice,
        typicalMin: candidate.typicalMin,
        typicalMax: candidate.typicalMax,
        pricingUnit: candidate.pricingUnit as PricingUnit,
      };

      if (!existing) {
        // Privacy shielding: exact street address is omitted for individuals!
        const publicAddress = candidate.isPublic ? candidate.addressLine : null;

        providerMap.set(candidate.id, {
          id: candidate.id,
          userId: candidate.userId,
          fullName: candidate.fullName,
          avatarUrl: candidate.avatarUrl,
          providerType: candidate.providerType as any,
          businessName: candidate.businessName,
          professionalTitle: candidate.professionalTitle,
          bio: candidate.bio,
          experienceYears: candidate.experienceYears,
          serviceMode: candidate.serviceMode as any,
          serviceRadiusKm: candidate.serviceRadiusKm,
          isVerified: candidate.isVerified,
          ratingAvg: candidate.reviewCount > 0 ? candidate.ratingAvg : null,
          reviewCount: candidate.reviewCount,
          availability: candidate.availability,
          area: candidate.area,
          city: candidate.city,
          calculatedDistanceKm: candidate.calculatedDistanceKm,
          publicAddress,
          services: [serviceSummary],
          matchScore: totalScore,
          explainableReasons: reasons,
        });
      } else {
        // Add service if not already present
        if (!existing.services.some(s => s.serviceId === serviceSummary.serviceId)) {
          existing.services.push(serviceSummary);
        }
      }
    }

    const allRanked = Array.from(providerMap.values());

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(20, Math.max(1, filters.limit || 10));
    const startIndex = (page - 1) * limit;
    const paginated = allRanked.slice(startIndex, startIndex + limit);

    return {
      providers: paginated,
      understanding,
      total: allRanked.length,
    };
  }
}
