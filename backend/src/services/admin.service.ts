import crypto from 'crypto';
import { getDatabase } from '../database/index.js';
import {
  PlatformMetrics,
  VerificationAttestation,
  MatchingConfiguration,
  AuditLogEntry,
} from '@civicsolve/shared';

export const DEFAULT_MATCHING_WEIGHTS = [
  { key: 'WEIGHT_SERVICE_MATCH', weight: 0.35, description: 'Direct canonical service or problem match score' },
  { key: 'WEIGHT_SKILL_OVERLAP', weight: 0.20, description: 'Secondary skill keywords & colloquial phrase overlap' },
  { key: 'WEIGHT_DISTANCE', weight: 0.15, description: 'Proximity decay based on spherical distance' },
  { key: 'WEIGHT_RADIUS_FIT', weight: 0.10, description: 'Coverage ratio within provider operating radius' },
  { key: 'WEIGHT_AVAILABILITY', weight: 0.05, description: 'Real-time online & active ready-to-serve status' },
  { key: 'WEIGHT_EXPERIENCE', weight: 0.05, description: 'Years of demonstrated field experience' },
  { key: 'WEIGHT_BAYESIAN_RATING', weight: 0.05, description: 'Bayesian mean weighted customer satisfaction' },
  { key: 'WEIGHT_VERIFICATION', weight: 0.05, description: 'Government or institutional credential attestation' },
];

export class AdminService {
  /**
   * Fetch aggregated platform health & growth metrics
   */
  static async getPlatformMetrics(): Promise<PlatformMetrics> {
    const db = getDatabase();

    const [userStats, providerStats, requestStats, reviewStats, unmetStats] = await Promise.all([
      db.queryOne<{ total_users: number; needers: number; providers: number }>(
        `SELECT 
           COUNT(*) as total_users,
           COALESCE(SUM(CASE WHEN role = 'NEEDER' THEN 1 ELSE 0 END), 0) as needers,
           COALESCE(SUM(CASE WHEN role = 'PROVIDER' THEN 1 ELSE 0 END), 0) as providers
         FROM users`
      ),
      db.queryOne<{ total_providers: number; verified_providers: number }>(
        `SELECT 
           COUNT(*) as total_providers,
           COALESCE(SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END), 0) as verified_providers
         FROM provider_profiles`
      ),
      db.queryOne<{ total_requests: number; completed_requests: number }>(
        `SELECT 
           COUNT(*) as total_requests,
           COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as completed_requests
         FROM service_requests`
      ),
      db.queryOne<{ total_reviews: number; avg_rating: number }>(
        `SELECT 
           COUNT(*) as total_reviews,
           COALESCE(AVG(rating), 0) as avg_rating
         FROM reviews`
      ),
      db.queryOne<{ unmet_count: number }>(
        `SELECT COUNT(*) as unmet_count FROM unmet_requirements`
      ),
    ]);

    return {
      totalUsers: Number(userStats?.total_users || 0),
      totalNeeders: Number(userStats?.needers || 0),
      totalProviders: Number(providerStats?.total_providers || 0),
      verifiedProviders: Number(providerStats?.verified_providers || 0),
      totalRequests: Number(requestStats?.total_requests || 0),
      completedRequests: Number(requestStats?.completed_requests || 0),
      totalReviews: Number(reviewStats?.total_reviews || 0),
      averageRating: Number(parseFloat(String(reviewStats?.avg_rating || 0)).toFixed(2)),
      unmetRequirementsCount: Number(unmetStats?.unmet_count || 0),
    };
  }

  /**
   * Retrieve provider verification queue
   */
  static async getAttestations(status?: string): Promise<VerificationAttestation[]> {
    const db = getDatabase();

    let sql = `
      SELECT 
        va.id,
        va.provider_id as "providerId",
        u.full_name as "providerName",
        pp.professional_title as "providerTitle",
        va.attestation_type as "attestationType",
        va.reference_data as "referenceData",
        va.status,
        va.verified_by_admin_id as "verifiedByAdminId",
        va.verified_at as "verifiedAt",
        va.created_at as "createdAt"
      FROM verification_attestations va
      JOIN provider_profiles pp ON va.provider_id = pp.id
      JOIN users u ON pp.user_id = u.id
    `;
    const params: any[] = [];

    if (status) {
      sql += ` WHERE va.status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY va.created_at DESC`;

    const res = await db.query<VerificationAttestation>(sql, params);
    return res.rows;
  }

  /**
   * Review provider verification attestation (VERIFIED or REJECTED)
   */
  static async reviewAttestation(
    attestationId: string,
    adminId: string,
    decision: 'VERIFIED' | 'REJECTED',
    notes?: string,
    ipAddress?: string
  ): Promise<VerificationAttestation> {
    const db = getDatabase();

    const attestation = await db.queryOne<{ id: string; provider_id: string; status: string }>(
      'SELECT id, provider_id, status FROM verification_attestations WHERE id = $1',
      [attestationId]
    );

    if (!attestation) {
      const err = new Error('Verification attestation not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();

    // 1. Update verification_attestations
    await db.query(
      `UPDATE verification_attestations 
       SET status = $1, verified_by_admin_id = $2, verified_at = $3
       WHERE id = $4`,
      [decision, adminId, now, attestationId]
    );

    // 2. Update provider profile is_verified flag
    const isVerifiedValue = decision === 'VERIFIED' ? 1 : 0;
    await db.query(
      `UPDATE provider_profiles 
       SET is_verified = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [isVerifiedValue, attestation.provider_id]
    );

    // 3. Record Audit Log
    const auditId = `aud-${crypto.randomUUID()}`;
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, details_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        auditId,
        adminId,
        `ATTESTATION_${decision}`,
        'VERIFICATION_ATTESTATION',
        attestationId,
        ipAddress || '127.0.0.1',
        JSON.stringify({ decision, notes, providerId: attestation.provider_id }),
      ]
    );

    const updated = await db.queryOne<VerificationAttestation>(
      `SELECT 
        va.id,
        va.provider_id as "providerId",
        u.full_name as "providerName",
        pp.professional_title as "providerTitle",
        va.attestation_type as "attestationType",
        va.reference_data as "referenceData",
        va.status,
        va.verified_by_admin_id as "verifiedByAdminId",
        va.verified_at as "verifiedAt",
        va.created_at as "createdAt"
      FROM verification_attestations va
      JOIN provider_profiles pp ON va.provider_id = pp.id
      JOIN users u ON pp.user_id = u.id
      WHERE va.id = $1`,
      [attestationId]
    );

    return updated!;
  }

  /**
   * Retrieve active matching configuration weights
   */
  static async getMatchingWeights(): Promise<MatchingConfiguration[]> {
    const db = getDatabase();
    const res = await db.query<MatchingConfiguration>(
      `SELECT id, key, weight, description, updated_at as "updatedAt"
       FROM matching_configuration
       ORDER BY key ASC`
    );

    if (res.rows.length === 0) {
      // Return defaults if none in DB
      return DEFAULT_MATCHING_WEIGHTS.map(w => ({
        id: `cfg-${w.key}`,
        key: w.key,
        weight: w.weight,
        description: w.description,
        updatedAt: new Date().toISOString(),
      }));
    }

    return res.rows;
  }

  /**
   * Update matching weights with validation & normalization checks
   */
  static async updateMatchingWeights(
    weights: Array<{ key: string; weight: number }>,
    adminId: string,
    ipAddress?: string
  ): Promise<MatchingConfiguration[]> {
    const db = getDatabase();

    if (!Array.isArray(weights) || weights.length === 0) {
      const err = new Error('Weights payload must be a non-empty array.');
      (err as any).statusCode = 400;
      throw err;
    }

    for (const item of weights) {
      if (typeof item.weight !== 'number' || item.weight < 0 || item.weight > 1.0) {
        const err = new Error(`Invalid weight for key ${item.key}. Must be between 0.0 and 1.0.`);
        (err as any).statusCode = 400;
        throw err;
      }
    }

    for (const item of weights) {
      await db.query(
        `UPDATE matching_configuration 
         SET weight = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE key = $2`,
        [item.weight, item.key]
      );
    }

    // Log update in audit_logs
    const auditId = `aud-${crypto.randomUUID()}`;
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, ip_address, details_json)
       VALUES ($1, $2, 'UPDATE_MATCHING_WEIGHTS', 'MATCHING_CONFIGURATION', $3, $4)`,
      [
        auditId,
        adminId,
        ipAddress || '127.0.0.1',
        JSON.stringify({ updatedCount: weights.length, keys: weights.map(w => w.key) }),
      ]
    );

    return this.getMatchingWeights();
  }

  /**
   * Reset matching weights to factory defaults
   */
  static async resetMatchingWeights(adminId: string, ipAddress?: string): Promise<MatchingConfiguration[]> {
    const db = getDatabase();

    for (const w of DEFAULT_MATCHING_WEIGHTS) {
      await db.query(
        `INSERT INTO matching_configuration (id, key, weight, description, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET weight = EXCLUDED.weight, updated_at = CURRENT_TIMESTAMP`,
        [`cfg-${w.key}`, w.key, w.weight, w.description]
      );
    }

    const auditId = `aud-${crypto.randomUUID()}`;
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, ip_address, details_json)
       VALUES ($1, $2, 'RESET_MATCHING_WEIGHTS', 'MATCHING_CONFIGURATION', $3, $4)`,
      [auditId, adminId, ipAddress || '127.0.0.1', JSON.stringify({ resetToDefaults: true })]
    );

    return this.getMatchingWeights();
  }

  /**
   * Fetch recent audit logs
   */
  static async getAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    const db = getDatabase();
    const safeLimit = Math.min(100, Math.max(1, limit));

    const res = await db.query<AuditLogEntry>(
      `SELECT 
        al.id,
        al.user_id as "userId",
        u.email as "userEmail",
        al.action,
        al.entity_type as "entityType",
        al.entity_id as "entityId",
        al.ip_address as "ipAddress",
        al.details_json as "detailsJson",
        al.created_at as "createdAt"
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1`,
      [safeLimit]
    );

    return res.rows;
  }
}
