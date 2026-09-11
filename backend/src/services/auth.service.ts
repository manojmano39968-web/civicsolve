import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../utils/token.js';
import { User, AuthSession } from '@civicsolve/shared';
import { config } from '../config/index.js';
import { getDatabase } from '../database/index.js';

export interface AuthTokensResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepo = new UserRepository();
  private sessionRepo = new SessionRepository();
  private db = getDatabase();

  async register(input: RegisterInput, ip?: string, device?: string): Promise<AuthTokensResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      const err: any = new Error('An account with this email already exists.');
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userId = `usr-${crypto.randomUUID()}`;

    const user = await this.userRepo.create({
      id: userId,
      email: input.email,
      passwordHash,
      role: input.role,
      fullName: input.fullName,
      phone: input.phone,
    });

    // If registered as provider, initialize a draft provider profile
    if (input.role === 'PROVIDER') {
      const profileId = `prof-${crypto.randomUUID()}`;
      await this.db.query(
        `INSERT INTO provider_profiles (id, user_id, provider_type, professional_title, service_mode, service_radius_km)
         VALUES ($1, $2, 'INDIVIDUAL', 'Service Provider', 'HOME_VISIT', 10.0)`,
        [profileId, userId]
      );
      // Initialize availability
      await this.db.query(
        `INSERT INTO provider_availability (id, provider_id, status)
         VALUES ($1, $2, 'AVAILABLE')`,
        [`avail-${profileId}`, profileId]
      );
    }

    // Generate token pair
    return this.createSessionAndTokens(user, ip, device);
  }

  async login(input: LoginInput, ip?: string, device?: string): Promise<AuthTokensResult> {
    const userRow = await this.userRepo.findByEmail(input.email);
    if (!userRow || !userRow.is_active) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(input.password, userRow.password_hash);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const user = await this.userRepo.findById(userRow.id);
    if (!user) throw new Error('User record missing');

    return this.createSessionAndTokens(user, ip, device);
  }

  async refresh(rawRefreshToken: string, ip?: string, device?: string): Promise<AuthTokensResult> {
    if (!rawRefreshToken) {
      const err: any = new Error('Refresh token is required.');
      err.statusCode = 401;
      err.code = 'REFRESH_TOKEN_REQUIRED';
      throw err;
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);

    if (!session) {
      const err: any = new Error('Invalid refresh token.');
      err.statusCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    // Token reuse breach detection: If already revoked, an attacker is reusing a stolen token!
    if (session.is_revoked) {
      console.warn(`🚨 SECURITY ALERT: Token reuse detected for user ${session.user_id}! Revoking all sessions.`);
      await this.sessionRepo.revokeAllUserSessions(session.user_id);
      const err: any = new Error('Security violation: token reuse detected. Please log in again.');
      err.statusCode = 401;
      err.code = 'TOKEN_REUSE_DETECTED';
      throw err;
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      const err: any = new Error('Refresh token has expired. Please log in again.');
      err.statusCode = 401;
      err.code = 'REFRESH_TOKEN_EXPIRED';
      throw err;
    }

    // Revoke the old token (rotation)
    await this.sessionRepo.revokeSession(session.id);

    // Fetch user
    const user = await this.userRepo.findById(session.user_id);
    if (!user || !user.isActive) {
      const err: any = new Error('User account is inactive or deleted.');
      err.statusCode = 401;
      err.code = 'ACCOUNT_INACTIVE';
      throw err;
    }

    // Issue new pair
    return this.createSessionAndTokens(user, ip, device);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (session) {
      await this.sessionRepo.revokeSession(session.id);
    }
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  private async createSessionAndTokens(
    user: User,
    ip?: string,
    device?: string
  ): Promise<AuthTokensResult> {
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const rawRefreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + config.jwtRefreshExpiresIn * 1000).toISOString();

    await this.sessionRepo.createSession({
      id: `sess-${crypto.randomUUID()}`,
      userId: user.id,
      refreshTokenHash,
      ipAddress: ip,
      deviceInfo: device,
      expiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}
