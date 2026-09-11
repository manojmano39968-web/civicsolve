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
}

const env = (process.env.NODE_ENV as AppConfig['env']) || 'development';

export const config: AppConfig = {
  env,
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL,
  sqlitePath: process.env.SQLITE_PATH || path.resolve(process.cwd(), '.data', 'civicsolve.db'),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_civicsolve_v2_min_32_chars_long!',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_civicsolve_v2_min_32_chars_long!',
  jwtAccessExpiresIn: 15 * 60, // 15 minutes
  jwtRefreshExpiresIn: 7 * 24 * 60 * 60, // 7 days
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || env === 'production',
};
