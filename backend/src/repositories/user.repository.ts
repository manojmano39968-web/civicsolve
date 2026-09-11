import { getDatabase } from '../database/index.js';
import { User, UserRole } from '@civicsolve/shared';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export class UserRepository {
  private db = getDatabase();

  async create(user: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    phone?: string;
  }): Promise<User> {
    const sql = `
      INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
    `;
    await this.db.query(sql, [
      user.id,
      user.email.toLowerCase().trim(),
      user.passwordHash,
      user.role,
      user.fullName.trim(),
      user.phone || null,
    ]);

    const created = await this.findById(user.id);
    if (!created) throw new Error('Failed to create user record');
    return created;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const sql = `
      SELECT * FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `;
    const result = await this.db.query<UserRow>(sql, [email.toLowerCase().trim()]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const sql = `
      SELECT id, email, role, full_name, phone, avatar_url, is_active, created_at, updated_at 
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.db.query(sql, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      role: row.role as UserRole,
      fullName: row.full_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
