import { getDatabase } from '../database/index.js';

export interface SessionRecord {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_info?: string | null;
  ip_address?: string | null;
  is_revoked: number;
  expires_at: string;
  created_at: string;
}

export class SessionRepository {
  private db = getDatabase();

  async createSession(session: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    deviceInfo?: string;
    ipAddress?: string;
    expiresAt: string;
  }): Promise<void> {
    const sql = `
      INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_info, ip_address, is_revoked, expires_at)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
    `;
    await this.db.query(sql, [
      session.id,
      session.userId,
      session.refreshTokenHash,
      session.deviceInfo || null,
      session.ipAddress || null,
      session.expiresAt,
    ]);
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const sql = `SELECT * FROM user_sessions WHERE refresh_token_hash = $1`;
    const result = await this.db.query<SessionRecord>(sql, [tokenHash]);
    return result.rows[0] || null;
  }

  async revokeSession(id: string): Promise<void> {
    const sql = `UPDATE user_sessions SET is_revoked = 1 WHERE id = $1`;
    await this.db.query(sql, [id]);
  }

  // Token reuse breach defense: revoke ALL active sessions for the user!
  async revokeAllUserSessions(userId: string): Promise<void> {
    const sql = `UPDATE user_sessions SET is_revoked = 1 WHERE user_id = $1`;
    await this.db.query(sql, [userId]);
  }
}
