import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Platform Admin Dashboard & Verification Triage (Milestone 9)', () => {
  let adminToken: string;
  let neederToken: string;
  let sampleAttestationId: string;

  beforeAll(async () => {
    await runSeeds();

    const ts = Date.now();

    // 1. Admin login
    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@civicsolve.org',
      password: 'Password@123',
    });
    expect(adminLoginRes.status).toBe(200);
    adminToken = adminLoginRes.body.data.accessToken;
    expect(adminLoginRes.body.data.user.role).toBe('ADMIN');

    // 2. Needer registration for RBAC check
    const neederRes = await request(app).post('/api/v1/auth/register').send({
      email: `admin_test_needer_${ts}@civicsolve.org`,
      password: 'Password@123',
      fullName: 'Test Needer User',
      role: 'NEEDER',
    });
    expect(neederRes.status).toBe(201);
    neederToken = neederRes.body.data.accessToken;
  });

  describe('RBAC & Security Guardrails', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/metrics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects non-admin roles (NEEDER) with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${neederToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Platform Metrics Aggregation', () => {
    it('returns platform metrics for authenticated admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const metrics = res.body.data;
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalUsers).toBe('number');
      expect(metrics.totalUsers).toBeGreaterThan(0);
      expect(typeof metrics.totalProviders).toBe('number');
      expect(metrics.totalProviders).toBeGreaterThan(0);
      expect(typeof metrics.verifiedProviders).toBe('number');
      expect(typeof metrics.totalRequests).toBe('number');
      expect(typeof metrics.averageRating).toBe('number');
    });
  });

  describe('Verification Triage Workflow', () => {
    it('lists provider verification attestations', async () => {
      const res = await request(app)
        .get('/api/v1/admin/attestations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        sampleAttestationId = res.body.data[0].id;
        expect(res.body.data[0].providerId).toBeDefined();
        expect(res.body.data[0].status).toBeDefined();
      }
    });

    it('approves a verification attestation and marks provider as verified', async () => {
      if (!sampleAttestationId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/attestations/${sampleAttestationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'VERIFIED',
          notes: 'Business GST registration verified via official portal.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('VERIFIED');
      expect(res.body.data.verifiedByAdminId).toBeDefined();

      // Check provider public profile reflects isVerified = true
      const provRes = await request(app).get(`/api/v1/providers/${res.body.data.providerId}`);
      expect(provRes.status).toBe(200);
      expect(provRes.body.data.isVerified).toBe(true);
    });

    it('rejects an invalid attestation decision', async () => {
      if (!sampleAttestationId) return;

      const res = await request(app)
        .patch(`/api/v1/admin/attestations/${sampleAttestationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'INVALID_STATUS',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Matching Weights Configuration Tuning', () => {
    it('retrieves active matching configuration weights', async () => {
      const res = await request(app)
        .get('/api/v1/admin/weights')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);

      const serviceMatchWeight = res.body.data.find(
        (w: any) => w.key === 'WEIGHT_SERVICE_MATCH'
      );
      expect(serviceMatchWeight).toBeDefined();
      expect(typeof serviceMatchWeight.weight).toBe('number');
    });

    it('updates matching weights with valid ranges', async () => {
      const res = await request(app)
        .put('/api/v1/admin/weights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          weights: [
            { key: 'WEIGHT_SERVICE_MATCH', weight: 0.40 },
            { key: 'WEIGHT_DISTANCE', weight: 0.20 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = res.body.data.find((w: any) => w.key === 'WEIGHT_SERVICE_MATCH');
      expect(updated.weight).toBe(0.40);
    });

    it('validates weight bounds (rejects weights < 0 or > 1.0)', async () => {
      const res = await request(app)
        .put('/api/v1/admin/weights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          weights: [{ key: 'WEIGHT_SERVICE_MATCH', weight: 1.5 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('resets matching weights to factory defaults', async () => {
      const res = await request(app)
        .post('/api/v1/admin/weights/reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const serviceMatch = res.body.data.find(
        (w: any) => w.key === 'WEIGHT_SERVICE_MATCH'
      );
      expect(serviceMatch.weight).toBe(0.35);
    });
  });

  describe('Audit Logging System', () => {
    it('retrieves system audit logs showing admin actions', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs?limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const actions = res.body.data.map((l: any) => l.action);
      expect(actions.some((a: string) => a.includes('WEIGHT') || a.includes('ATTESTATION'))).toBe(true);
    });
  });
});
