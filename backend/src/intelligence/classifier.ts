import { Service } from '@civicsolve/shared';

/**
 * Layer 6: Category Classification
 * Aggregates service relevance signals up to the taxonomy category level.
 */

export interface CategoryScore {
  slug: string;
  name: string;
  confidence: number;
}

export function classifyCategories(
  serviceMatches: { service: Service; score: number }[]
): CategoryScore[] {
  const categoryScores = new Map<string, { name: string; totalScore: number; count: number }>();

  for (const match of serviceMatches) {
    const catSlug = match.service.categorySlug || 'general';
    const catName = match.service.categoryName || 'General';
    const current = categoryScores.get(catSlug) || { name: catName, totalScore: 0, count: 0 };
    categoryScores.set(catSlug, {
      name: catName,
      totalScore: current.totalScore + match.score,
      count: current.count + 1,
    });
  }

  // Find max total score for normalization
  let maxScore = 0;
  for (const val of categoryScores.values()) {
    if (val.totalScore > maxScore) maxScore = val.totalScore;
  }

  const results: CategoryScore[] = [];
  for (const [slug, val] of categoryScores.entries()) {
    const confidence = maxScore > 0 ? Math.min(1.0, Math.round((val.totalScore / maxScore) * 100) / 100) : 0;
    results.push({
      slug,
      name: val.name,
      confidence,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}
