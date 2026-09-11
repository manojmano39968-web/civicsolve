import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  databaseUrl?: string;
  sqlitePath: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: number; // in seconds (e.g., 900 = 15m)
  jwtRefreshExpiresIn: number; // in seconds (e.g., 604800 = 7d)
  allowedOrigins: string[];
  cookieSecure: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
  trustProxy: boolean;
}

export const DEFAULT_DEV_ACCESS_SECRET = 'dev_jwt_access_secret_civicsolve_v2_min_32_chars_long!';
export const DEFAULT_DEV_REFRESH_SECRET = 'dev_jwt_refresh_secret_civicsolve_v2_min_32_chars_long!';

export function loadConfig(envOverrides?: Record<string, string | undefined>): AppConfig {
  const currentEnv = (envOverrides?.NODE_ENV || process.env.NODE_ENV || 'development') as AppConfig['env'];
  const isProd = currentEnv === 'production';

  const accessSecret = envOverrides?.JWT_ACCESS_SECRET ?? process.env.JWT_ACCESS_SECRET;
  const refreshSecret = envOverrides?.JWT_REFRESH_SECRET ?? process.env.JWT_REFRESH_SECRET;

  if (isProd) {
    if (!accessSecret || !refreshSecret) {
      throw new Error('FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in production.');
    }
    if (accessSecret === DEFAULT_DEV_ACCESS_SECRET || refreshSecret === DEFAULT_DEV_REFRESH_SECRET) {
      throw new Error('FATAL: Default development JWT secrets cannot be used in production.');
    }
    if (accessSecret.length < 32 || refreshSecret.length < 32) {
      throw new Error('FATAL: JWT secrets must be at least 32 characters in production.');
    }
  }

  return {
    env: currentEnv,
    port: parseInt(envOverrides?.PORT || process.env.PORT || '5000', 10),
    databaseUrl: envOverrides?.DATABASE_URL || process.env.DATABASE_URL,
    sqlitePath: envOverrides?.SQLITE_PATH || process.env.SQLITE_PATH || path.resolve(process.cwd(), '.data', 'civicsolve.db'),
    jwtAccessSecret: accessSecret || DEFAULT_DEV_ACCESS_SECRET,
    jwtRefreshSecret: refreshSecret || DEFAULT_DEV_REFRESH_SECRET,
    jwtAccessExpiresIn: 15 * 60, // 15 minutes
    jwtRefreshExpiresIn: 7 * 24 * 60 * 60, // 7 days
    allowedOrigins: (envOverrides?.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
    cookieSecure: (envOverrides?.COOKIE_SECURE ?? process.env.COOKIE_SECURE) === 'true' || isProd || (envOverrides?.COOKIE_SAME_SITE || process.env.COOKIE_SAME_SITE) === 'none',
    cookieSameSite: ((envOverrides?.COOKIE_SAME_SITE || process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none'),
    trustProxy: (envOverrides?.TRUST_PROXY ?? process.env.TRUST_PROXY) === 'true' || isProd,
  };
}

export const config: AppConfig = loadConfig();
