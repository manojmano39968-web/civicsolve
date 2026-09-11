import crypto from 'crypto';
import { getDatabase } from '../database/index.js';
import { Review, CreateReviewPayload } from '@civicsolve/shared';

export class ReviewService {
  /**
   * Submit a verified review for a completed service request
   * Implements Bayesian reputation recalculation and idempotency
   */
  static async createReview(
    neederId: string,
    requestId: string,
    payload: { problemSolved: boolean; rating: number; comment?: string }
  ): Promise<Review> {
    const db = getDatabase();

    // 1. Validation
    if (payload.rating < 1 || payload.rating > 5) {
      const err = new Error('Rating must be between 1 and 5 stars.');
      (err as any).statusCode = 400;
      throw err;
    }

    // 2. Fetch request
    const request = await db.queryOne<{
      id: string;
      needer_id: string;
      provider_id: string;
      status: string;
    }>(
      'SELECT id, needer_id, provider_id, status FROM service_requests WHERE id = ?',
      [requestId]
    );

    if (!request) {
      const err = new Error('Service request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Needer ABAC check
    if (request.needer_id !== neederId) {
      const err = new Error('Only the solution needer who requested this service can submit a review.');
      (err as any).statusCode = 403;
      throw err;
    }

    // 3. Duplicate check (idempotency - return 409 Conflict)
    const existingReview = await db.queryOne<{ id: string }>(
      'SELECT id FROM reviews WHERE request_id = ?',
      [requestId]
    );
    if (existingReview || request.status === 'REVIEWED') {
      const err = new Error('A verified review has already been submitted for this service request.');
      (err as any).statusCode = 409;
      throw err;
    }

    // Must be in COMPLETED state
    if (request.status !== 'COMPLETED') {
      const err = new Error(
        `Cannot review request with status "${request.status}". Only COMPLETED requests can be reviewed.`
      );
      (err as any).statusCode = 400;
      throw err;
    }

    const reviewId = `rev-${crypto.randomUUID()}`;

    // 4. Insert Review & update request status in transaction
    await db.transaction(async () => {
      await db.run(
        `INSERT INTO reviews (
          id, request_id, needer_id, provider_id, problem_solved, rating, comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          reviewId,
          requestId,
          neederId,
          request.provider_id,
          payload.problemSolved ? 1 : 0,
          payload.rating,
          payload.comment || null,
        ]
      );

      // Transition request status to REVIEWED
      await db.run(
        `UPDATE service_requests 
         SET status = 'REVIEWED', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [requestId]
      );

      // Record timeline history
      await db.run(
        `INSERT INTO request_status_history (
          id, request_id, from_status, to_status, note, changed_by_user_id
        ) VALUES (?, ?, 'COMPLETED', 'REVIEWED', 'Verified review submitted', ?)`,
        [`hist-${crypto.randomUUID()}`, requestId, neederId]
      );

      // 5. Recalculate Bayesian Average for Provider
      const reviewsResult = await db.query<{ rating: number }>(
        'SELECT rating FROM reviews WHERE provider_id = ?',
        [request.provider_id]
      );

      const reviewCount = reviewsResult.rows.length;
      const sumRatings = reviewsResult.rows.reduce((acc, r) => acc + r.rating, 0);
      const rawAvg = reviewCount > 0 ? sumRatings / reviewCount : 4.0;

      // Bayesian weighting formula:
      // WR = (v / (v + m)) * R + (m / (v + m)) * C
      // v = number of reviews
      // m = minimum review threshold (3)
      // C = global mean rating prior (4.0)
      const m = 3;
      const C = 4.0;
      const bayesianRating = (reviewCount * rawAvg + m * C) / (reviewCount + m);
      const roundedRating = Math.round(bayesianRating * 10) / 10;

      await db.run(
        `UPDATE provider_profiles 
         SET rating_avg = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [roundedRating, reviewCount, request.provider_id]
      );
    });

    const needer = await db.queryOne<{ full_name: string }>(
      'SELECT full_name FROM users WHERE id = ?',
      [neederId]
    );

    return {
      id: reviewId,
      requestId,
      neederId,
      neederName: needer?.full_name || 'Customer',
      providerId: request.provider_id,
      problemSolved: payload.problemSolved,
      rating: payload.rating,
      comment: payload.comment || null,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get public reviews for a problem solver
   */
  static async getProviderReviews(providerId: string): Promise<Review[]> {
    const db = getDatabase();

    const result = await db.query<{
      id: string;
      request_id: string;
      needer_id: string;
      full_name: string;
      provider_id: string;
      problem_solved: number;
      rating: number;
      comment?: string;
      created_at: string;
    }>(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON r.needer_id = u.id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC`,
      [providerId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      requestId: row.request_id,
      neederId: row.needer_id,
      neederName: row.full_name,
      providerId: row.provider_id,
      problemSolved: row.problem_solved === 1,
      rating: row.rating,
      comment: row.comment || null,
      createdAt: row.created_at,
    }));
  }
}
