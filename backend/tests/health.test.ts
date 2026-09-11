import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('API Health Check', () => {
  it('GET /api/v1/health should return 200 and healthy status', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.service).toBe('CivicSolve V2 API');
    expect(response.body.data.version).toBe('2.0.0');
    expect(response.body.meta.requestId).toBeDefined();
  });
});
