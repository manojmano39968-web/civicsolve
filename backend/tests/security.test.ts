import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { loadConfig, DEFAULT_DEV_ACCESS_SECRET } from '../src/config/index.js';

describe('Security Controls & Hardening (Phase 2 & Phase 3)', () => {
  describe('Fail-Closed Production JWT Secrets', () => {
    it('throws fatal error in production when JWT_ACCESS_SECRET is missing', () => {
      expect(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_ACCESS_SECRET: '',
          JWT_REFRESH_SECRET: 'a_very_secure_production_refresh_secret_that_is_long_enough!',
        });
      }).toThrow(/FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in production/);
    });

    it('throws fatal error in production when JWT_REFRESH_SECRET is missing', () => {
      expect(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_ACCESS_SECRET: 'a_very_secure_production_access_secret_that_is_long_enough!',
          JWT_REFRESH_SECRET: '',
        });
      }).toThrow(/FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in production/);
    });

    it('rejects default development secrets in production', () => {
      expect(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_ACCESS_SECRET: DEFAULT_DEV_ACCESS_SECRET,
          JWT_REFRESH_SECRET: 'valid_long_random_refresh_secret_for_production_12345!',
        });
      }).toThrow(/FATAL: Default development JWT secrets cannot be used in production/);
    });

    it('rejects secrets shorter than 32 characters in production', () => {
      expect(() => {
        loadConfig({
          NODE_ENV: 'production',
          JWT_ACCESS_SECRET: 'short_secret',
          JWT_REFRESH_SECRET: 'another_short_secret',
        });
      }).toThrow(/FATAL: JWT secrets must be at least 32 characters in production/);
    });

    it('succeeds in production when valid, non-default, long secrets are provided', () => {
      const cfg = loadConfig({
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'real_production_access_secret_32_chars_long_and_secure!',
        JWT_REFRESH_SECRET: 'real_production_refresh_secret_32_chars_long_and_secure!',
      });
      expect(cfg.env).toBe('production');
      expect(cfg.cookieSecure).toBe(true);
      expect(cfg.trustProxy).toBe(true);
    });

    it('allows safe local defaults in development and test environments', () => {
      const devCfg = loadConfig({ NODE_ENV: 'development', JWT_ACCESS_SECRET: undefined, JWT_REFRESH_SECRET: undefined });
      expect(devCfg.env).toBe('development');
      expect(devCfg.jwtAccessSecret).toBe(DEFAULT_DEV_ACCESS_SECRET);

      const testCfg = loadConfig({ NODE_ENV: 'test', JWT_ACCESS_SECRET: undefined, JWT_REFRESH_SECRET: undefined });
      expect(testCfg.env).toBe('test');
      expect(testCfg.jwtAccessSecret).toBe(DEFAULT_DEV_ACCESS_SECRET);
    });
  });

  describe('Rate Limiting & Health Probe Exemption', () => {
    it('ensures health check endpoint remains accessible without rate limiting', async () => {
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/api/v1/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('enforces rate limit headers on API requests', async () => {
      const res = await request(app).get('/api/v1/taxonomy/categories');
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Production Seed Safety Guard', () => {
    it('blocks running seeds in production when ALLOW_PROD_SEED is not set', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalAllow = process.env.ALLOW_PROD_SEED;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ALLOW_PROD_SEED;

        const { runSeeds } = await import('../src/database/seed.js');
        await expect(runSeeds()).rejects.toThrow(
          /Database seeding is blocked in production to prevent inserting demo credentials/
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalAllow) process.env.ALLOW_PROD_SEED = originalAllow;
      }
    });
  });
});
