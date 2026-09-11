import fs from 'fs';
import path from 'path';
import pg from 'pg';
import Database from 'better-sqlite3';
import { config } from '../config/index.js';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface IDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T>(callback: (client: IDatabase) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isPostgres(): boolean;
}

/**
 * PostgreSQL Implementation (Production)
 */
class PostgresDatabase implements IDatabase {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: config.env === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const result = await this.pool.query(sql, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0,
    };
  }

  async transaction<T>(callback: (client: IDatabase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const transactionalDb: IDatabase = {
        query: async <R = any>(sql: string, params: any[] = []): Promise<QueryResult<R>> => {
          const res = await client.query(sql, params);
          return { rows: res.rows as R[], rowCount: res.rowCount ?? 0 };
        },
        transaction: async () => {
          throw new Error('Nested transactions not supported');
        },
        close: async () => {},
        isPostgres: () => true,
      };
      const result = await callback(transactionalDb);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  isPostgres(): boolean {
    return true;
  }
}

/**
 * SQLite Implementation (Local Development & Fast Testing)
 */
class SQLiteDatabase implements IDatabase {
  private db: Database.Database;

  constructor(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(filePath);
    // Enable WAL mode and foreign key constraints
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  // Convert PostgreSQL $1, $2, $3 to SQLite ?, ?, ?
  private convertSql(sql: string): string {
    return sql.replace(/\$(\d+)/g, '?');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const convertedSql = this.convertSql(sql);
    const trimmed = convertedSql.trim().toUpperCase();

    // Serialize boolean values for SQLite (1 / 0) and JSON objects
    const normalizedParams = params.map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      return p;
    });

    try {
      if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
        const stmt = this.db.prepare(convertedSql);
        const rows = stmt.all(...normalizedParams) as T[];
        return {
          rows,
          rowCount: rows.length,
        };
      } else {
        const stmt = this.db.prepare(convertedSql);
        const info = stmt.run(...normalizedParams);
        return {
          rows: [] as T[],
          rowCount: info.changes,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async transaction<T>(callback: (client: IDatabase) => Promise<T>): Promise<T> {
    this.db.exec('BEGIN');
    try {
      const transactionalDb: IDatabase = {
        query: this.query.bind(this),
        transaction: async () => {
          throw new Error('Nested transactions not supported');
        },
        close: async () => {},
        isPostgres: () => false,
      };
      const result = await callback(transactionalDb);
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        this.db.exec('ROLLBACK');
      } catch {
        // ignore rollback errors if already aborted
      }
      throw err;
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  isPostgres(): boolean {
    return false;
  }
}

// Singleton Database instance
let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    if (config.databaseUrl) {
      console.log('📦 Connecting to PostgreSQL database...');
      dbInstance = new PostgresDatabase(config.databaseUrl);
    } else {
      console.log(`📦 Connecting to SQLite database at: ${config.sqlitePath}`);
      dbInstance = new SQLiteDatabase(config.sqlitePath);
    }
  }
  return dbInstance;
}
