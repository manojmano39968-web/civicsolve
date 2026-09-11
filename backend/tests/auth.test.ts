import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Authentication & Session Management', () => {
  beforeAll(async () => {
    await runSeeds();
  });

  const testEmail = `newuser_${Date.now()}@civicsolve.org`;
  const testUser = {
    email: testEmail,
    password: 'SecurePassword123!',
    fullName: 'Test Citizen',
    phone: '+91 99999 88888',
    role: 'NEEDER' as const,
  };

  it('POST /api/v1/auth/register should register a new needer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe('NEEDER');
    expect(res.body.data.accessToken).toBeDefined();

    // Check that refresh cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.includes('refreshToken='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);
  });

  it('POST /api/v1/auth/register should reject duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/v1/auth/login should authenticate valid user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/v1/auth/me should return authenticated user details', async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    const token = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email);
  });

  it('GET /api/v1/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/auth/refresh should rotate refresh tokens and detect token reuse', async () => {
    // 1. Login to get initial refresh token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookieHeader = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookieHeader.find((c: string) => c.includes('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();

    // 2. Perform valid refresh using the cookie
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshTokenCookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // The new refresh token should be returned in set-cookie
    const newCookies = refreshRes.headers['set-cookie'];
    const newRefreshCookie = newCookies.find((c: string) => c.includes('refreshToken='));
    expect(newRefreshCookie).toBeDefined();

    // 3. SECURITY TEST: Replay the OLD refresh token!
    // The old token has been rotated (is_revoked = 1).
    // Replaying it must trigger TOKEN_REUSE_DETECTED and revoke all user sessions!
    const replayRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshTokenCookie);

    expect(replayRes.status).toBe(401);
    expect(replayRes.body.success).toBe(false);
    expect(replayRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');

    // 4. Verify that the NEW token was also revoked because of the breach!
    const subsequentRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', newRefreshCookie);

    expect(subsequentRes.status).toBe(401);
  });
});
