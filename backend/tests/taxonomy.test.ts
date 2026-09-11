import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Taxonomy API Endpoints', () => {
  beforeAll(async () => {
    await runSeeds();
  });

  it('GET /api/v1/taxonomy/categories should return active categories with service count', async () => {
    const res = await request(app).get('/api/v1/taxonomy/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(7);

    const firstCat = res.body.data[0];
    expect(firstCat.id).toBeDefined();
    expect(firstCat.slug).toBeDefined();
    expect(firstCat.name).toBeDefined();
    expect(typeof firstCat.serviceCount).toBe('number');
  });

  it('GET /api/v1/taxonomy/services should return all active services with aliases', async () => {
    const res = await request(app).get('/api/v1/taxonomy/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(30);

    const painter = res.body.data.find((s: any) => s.slug === 'painter');
    expect(painter).toBeDefined();
    expect(painter.name).toBe('Painter');
    expect(painter.categoryName).toBe('Home & Maintenance');
    expect(Array.isArray(painter.aliases)).toBe(true);
    expect(painter.aliases).toContain('house painting');
  });

  it('GET /api/v1/taxonomy/categories/home-maintenance/services should return filtered services', async () => {
    const res = await request(app).get('/api/v1/taxonomy/categories/home-maintenance/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.slug).toBe('home-maintenance');
    expect(Array.isArray(res.body.data.services)).toBe(true);
    expect(res.body.data.services.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/v1/taxonomy/categories/invalid-slug/services should return 404', async () => {
    const res = await request(app).get('/api/v1/taxonomy/categories/non-existent-category/services');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });
});
