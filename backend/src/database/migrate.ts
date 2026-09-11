import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  let schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    const candidates = [
      path.resolve(__dirname, '../../src/database/schema.sql'),
      path.resolve(__dirname, '../src/database/schema.sql'),
      path.resolve(process.cwd(), 'src/database/schema.sql'),
      path.resolve(process.cwd(), 'backend/src/database/schema.sql'),
      path.resolve(process.cwd(), 'backend/dist/database/schema.sql'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        schemaPath = candidate;
        break;
      }
    }
  }

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath} or any standard fallback paths.`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Running database migrations...');

  // Split SQL by semicolon, filtering out empty blocks and comments
  const statements = schemaSql
    .split(';')
    .map(st => st.trim())
    .filter(st => st.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err: any) {
      console.error(`❌ Migration failed on statement:\n${statement.substring(0, 100)}...`);
      throw err;
    }
  }

  console.log(`✅ Successfully executed ${statements.length} migration statements.`);
}

// If executed directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
