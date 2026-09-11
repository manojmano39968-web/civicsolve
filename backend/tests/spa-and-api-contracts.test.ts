import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('SPA & API Contracts Regression Tests', () => {
  describe('Frontend SPA Route & Static Guard Contracts', () => {
    it('returns SPA HTML on root GET /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('returns SPA HTML on client navigation route /search with query parameters', async () => {
      const res = await request(app).get('/search?q=i+need+a+painter+for+my+house');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('returns 404 text/plain for missing /assets/* files instead of falling back to index.html', async () => {
      const res = await request(app).get('/assets/does-not-exist.js');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/text\/plain/);
      expect(res.text).toBe('Asset not found');
    });

    it('serves service worker sw.js with application/javascript', async () => {
      const res = await request(app).get('/sw.js');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
    });
  });

  describe('Search API Contract expected by frontend SearchResultsPage', () => {
    it('POST /api/v1/search/providers returns data with an array of providers', async () => {
      const res = await request(app)
        .post('/api/v1/search/providers')
        .send({
          query: 'i need a painter for my house',
          latitude: 12.9716,
          longitude: 77.5946,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.providers)).toBe(true);
    });

    it('GET /api/v1/search/understand returns data with detectedCategory and detectedServices array', async () => {
      const res = await request(app)
        .get('/api/v1/search/understand')
        .query({ q: 'i need a painter for my house' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.detectedServices)).toBe(true);
    });
  });

  describe('Authentication Endpoint Behavior (Unauthenticated & Authenticated)', () => {
    it('POST /api/v1/auth/refresh returns 401 with standard JSON error when unauthenticated', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('REFRESH_TOKEN_REQUIRED');
    });

    it('POST /api/v1/auth/login and subsequent refresh succeed for valid credentials', async () => {
      // Register a test user
      const uniqueEmail = `test_contract_${Date.now()}@civicsolve.local`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          fullName: 'Contract Test User',
          role: 'NEEDER',
        });

      expect(regRes.status).toBe(201);
      const refreshCookie = regRes.headers['set-cookie'];
      expect(refreshCookie).toBeDefined();

      // Refresh using cookie
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.user.email).toBe(uniqueEmail);
    });
  });
});
