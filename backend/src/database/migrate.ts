import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  const schemaPath = path.resolve(__dirname, 'schema.sql');
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
