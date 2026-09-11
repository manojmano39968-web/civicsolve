import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('CivicSolve Intelligence Engine & Search Matrix', () => {
  beforeAll(async () => {
    await runSeeds();
  });

  // Section 35 Required Test Cases Matrix
  const requiredMatrix = [
    { query: 'painter', expectedServiceSlug: 'painter' },
    { query: 'I need a painter', expectedServiceSlug: 'painter', expectedIntent: 'SERVICE_SEARCH' },
    { query: 'house painting', expectedServiceSlug: 'painter' },
    { query: 'paint my house', expectedServiceSlug: 'painter' },
    { query: 'wall needs painting', expectedServiceSlug: 'painter', expectedIntent: 'PROBLEM_REPORT' },
    { query: 'painting service', expectedServiceSlug: 'painter' },
    { query: 'laptop not working', expectedServiceSlug: 'laptop-repair', expectedIntent: 'PROBLEM_REPORT' },
    { query: 'computer repair', expectedServiceSlug: 'computer-repair' },
    { query: 'need a computer technician', expectedServiceSlug: 'computer-repair' },
    { query: 'my bathroom tap is leaking', expectedServiceSlug: 'plumber', expectedIntent: 'PROBLEM_REPORT' },
    { query: 'need a Java teacher', expectedServiceSlug: 'java-tutor', expectedIntent: 'SKILL_SEARCH' },
    { query: 'need someone for my college project', expectedServiceSlug: 'project-guidance', expectedIntent: 'COLLEGE_HELP' },
  ];

  for (const tc of requiredMatrix) {
    it(`Query: "${tc.query}" should resolve to service "${tc.expectedServiceSlug}"`, async () => {
      const res = await request(app)
        .get('/api/v1/search/understand')
        .query({ q: tc.query });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const understanding = res.body.data;
      expect(understanding.detectedServices.length).toBeGreaterThan(0);
      expect(understanding.detectedServices[0].slug).toBe(tc.expectedServiceSlug);

      if (tc.expectedIntent) {
        expect(understanding.intent).toBe(tc.expectedIntent);
      }
    });
  }

  // Additional Quality & Robustness Tests
  it('Typo resilience: "plubmer" should resolve to "plumber"', async () => {
    const res = await request(app)
      .get('/api/v1/search/understand')
      .query({ q: 'need urgent plubmer for tap leak' });

    expect(res.status).toBe(200);
    expect(res.body.data.detectedServices[0].slug).toBe('plumber');
  });

  it('Typo resilience: "panchar repair" should resolve to "puncture-repair"', async () => {
    const res = await request(app)
      .get('/api/v1/search/understand')
      .query({ q: 'bike panchar repair' });

    expect(res.status).toBe(200);
    expect(res.body.data.detectedServices[0].slug).toBe('puncture-repair');
  });

  it('Ambiguity gate: "my screen is broken" should ask for clarification', async () => {
    const res = await request(app)
      .get('/api/v1/search/understand')
      .query({ q: 'my screen is broken' });

    expect(res.status).toBe(200);
    const understanding = res.body.data;
    // Should trigger clarification between Laptop Repair and Mobile Repair
    expect(understanding.needsClarification).toBe(true);
    expect(understanding.clarificationOptions).toBeDefined();
    expect(understanding.clarificationOptions.length).toBeGreaterThanOrEqual(2);
  });

  it('Ranked Search: "need a painter" should return ranked providers with explainable reasons', async () => {
    const res = await request(app)
      .post('/api/v1/search/providers')
      .send({
        query: 'need a painter for house wall',
        latitude: 12.9716,
        longitude: 77.5946,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.providers.length).toBeGreaterThan(0);

    const topProvider = res.body.data.providers[0];
    expect(topProvider.professionalTitle).toContain('Painter');
    expect(topProvider.matchScore).toBeGreaterThanOrEqual(50);
    expect(topProvider.explainableReasons).toBeDefined();
    expect(topProvider.explainableReasons.length).toBeGreaterThan(0);

    const exactServiceReason = topProvider.explainableReasons.find(
      (r: any) => r.type === 'EXACT_SERVICE'
    );
    expect(exactServiceReason).toBeDefined();
    expect(exactServiceReason.positive).toBe(true);
  });

  it('Hard Radius Filtering: Provider outside service radius is strictly excluded', async () => {
    // Search 60 km away from Bengaluru (e.g. coordinates near Kolar: 13.13, 78.13)
    const res = await request(app)
      .post('/api/v1/search/providers')
      .send({
        query: 'need a painter',
        latitude: 13.50,
        longitude: 78.50,
      });

    expect(res.status).toBe(200);
    // Painters have max radius of 12-15 km, so they MUST be excluded!
    expect(res.body.data.providers.length).toBe(0);
  });

  it('No-Result Demand Capture: POST /api/v1/search/requirements saves unmet demand', async () => {
    const res = await request(app)
      .post('/api/v1/search/requirements')
      .send({
        rawQuery: 'need a drone pilot for agricultural mapping',
        city: 'Bengaluru',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  describe('Search Input Validation & Abuse Defense', () => {
    it('rejects empty query string with 400', async () => {
      const res = await request(app).get('/api/v1/search/understand?q=');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects query strings exceeding 300 characters with 400', async () => {
      const longQuery = 'a'.repeat(301);
      const res = await request(app).get(`/api/v1/search/understand?q=${longQuery}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('cannot exceed 300 characters');
    });

    it('rejects invalid filter parameters (limit > 50 or invalid latitude) with 400', async () => {
      const resLimit = await request(app)
        .post('/api/v1/search/providers')
        .send({ query: 'plumber', limit: 100 });
      expect(resLimit.status).toBe(400);

      const resLat = await request(app)
        .post('/api/v1/search/providers')
        .send({ query: 'plumber', latitude: 150 });
      expect(resLat.status).toBe(400);
    });
  });
});
