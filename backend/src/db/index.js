const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const Database = require('better-sqlite3');

let dbClient = null;
let activeMode = 'sqlite'; // 'postgres' | 'sqlite'
let sqliteDb = null;
let pgPool = null;

const SQLITE_FILE = path.join(__dirname, '../../../database/civicsolve.db');

/**
 * Initialize Database Connection
 */
function initDatabase() {
    if (process.env.DATABASE_URL && process.env.DB_CLIENT !== 'sqlite') {
        try {
            const isCloud = process.env.NODE_ENV === 'production' || 
                            process.env.DATABASE_URL.includes('render.com') || 
                            process.env.DATABASE_URL.includes('neon.tech') ||
                            process.env.DATABASE_URL.includes('supabase.co');
            pgPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: isCloud ? { rejectUnauthorized: false } : false
            });
            activeMode = 'postgres';
            console.log('✅ Database Adapter: Connected via PostgreSQL Pool');
        } catch (err) {
            console.warn('⚠️ PostgreSQL connection failed, falling back to SQLite:', err.message);
            initSqlite();
        }
    } else {
        initSqlite();
    }
}

function initSqlite() {
    const dir = path.dirname(SQLITE_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    sqliteDb = new Database(SQLITE_FILE);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    activeMode = 'sqlite';
    console.log(`✅ Database Adapter: Connected via SQLite (${SQLITE_FILE})`);
}

/**
 * Execute parameterized query
 * Translates $1, $2 syntax to ? for SQLite compatibility
 */
async function query(sql, params = []) {
    if (!sqliteDb && !pgPool) {
        initDatabase();
    }

    if (activeMode === 'postgres' && pgPool) {
        try {
            const res = await pgPool.query(sql, params);
            return res;
        } catch (err) {
            console.error('Postgres Query Error:', err.message, 'SQL:', sql);
            throw err;
        }
    }

    // SQLite mode
    try {
        // Convert $1, $2, ... to ? for SQLite
        let sqliteSql = sql.replace(/\$(\d+)/g, '?');

        const trimmed = sqliteSql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
            const stmt = sqliteDb.prepare(sqliteSql);
            const rows = stmt.all(...params);
            return { rows, rowCount: rows.length };
        } else {
            const stmt = sqliteDb.prepare(sqliteSql);
            const info = stmt.run(...params);
            return {
                rows: [],
                rowCount: info.changes,
                lastInsertRowid: info.lastInsertRowid
            };
        }
    } catch (err) {
        console.error('SQLite Query Error:', err.message, 'SQL:', sql);
        throw err;
    }
}

function getActiveMode() {
    if (!sqliteDb && !pgPool) {
        initDatabase();
    }
    return {
        mode: activeMode,
        databaseFile: activeMode === 'sqlite' ? SQLITE_FILE : 'PostgreSQL Instance',
        isFallback: activeMode === 'sqlite' && Boolean(process.env.DATABASE_URL)
    };
}

/**
 * Run DDL to create tables
 */
async function initSchema() {
    if (!sqliteDb && !pgPool) {
        initDatabase();
    }
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        institution TEXT,
        location TEXT NOT NULL,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        proficiency TEXT DEFAULT 'Intermediate',
        PRIMARY KEY (user_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        severity TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Submitted',
        submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS challenge_skills (
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        PRIMARY KEY (challenge_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'Suggested'
    );

    CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_members (
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        PRIMARY KEY (team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'Pending',
        due_date TEXT
    );

    CREATE TABLE IF NOT EXISTS solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Draft'
    );

    CREATE TABLE IF NOT EXISTS progress_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        percentage INTEGER NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS impact_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        metric_name TEXT NOT NULL,
        baseline_value TEXT NOT NULL,
        target_value TEXT NOT NULL,
        current_value TEXT NOT NULL,
        unit TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    if (activeMode === 'sqlite') {
        sqliteDb.exec(schemaSql);
    } else if (pgPool) {
        // Read schema.sql for postgres
        const pgSchemaPath = path.join(__dirname, '../../../database/migrations/schema.sql');
        const pgSchema = fs.readFileSync(pgSchemaPath, 'utf8');
        await pgPool.query(pgSchema);
    }
    console.log('✅ Database schema initialized successfully');
}

module.exports = {
    initDatabase,
    initSqlite,
    query,
    getActiveMode,
    initSchema
};
