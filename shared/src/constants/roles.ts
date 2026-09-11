import { UserRole } from '../types/auth.js';

export const ROLES = {
  NEEDER: 'NEEDER' as UserRole,
  PROVIDER: 'PROVIDER' as UserRole,
  ADMIN: 'ADMIN' as UserRole
} as const;

export const DEFAULT_SEARCH_RADIUS_KM = 10;
export const MAX_SEARCH_RADIUS_KM = 50;
export const MIN_SEARCH_RADIUS_KM = 1;
