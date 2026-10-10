import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let supabaseClient = null;

export function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const host = process.env.PGHOST || process.env.DB_HOST || 'db.heikbrdhbojeetopiakz.supabase.co';
  const port = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10);
  const database = process.env.PGDATABASE || process.env.DB_NAME || 'postgres';
  const user = process.env.PGUSER || process.env.DB_USER || 'postgres';
  const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  } else if (password) {
    pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false },
    });
  } else {
    // No password provided yet
    return null;
  }

  pool.on('error', (err) => {
    console.error('[Database Pool Error]:', err.message);
  });

  return pool;
}

  export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] URL or secret key is missing.');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;

}

export async function initDatabase() {
  console.log('[Database] Checking Supabase PostgreSQL configuration...');
  const host = process.env.PGHOST || process.env.DB_HOST || 'db.heikbrdhbojeetopiakz.supabase.co';
  const port = process.env.PGPORT || process.env.DB_PORT || '5432';
  const database = process.env.PGDATABASE || process.env.DB_NAME || 'postgres';
  const user = process.env.PGUSER || process.env.DB_USER || 'postgres';
  console.log(`[Database] Target: host=${host}, port=${port}, database=${database}, user=${user}`);

  const p = getPool();
  if (p) {
    try {
      const client = await p.connect();
      try {
        console.log('[Database] Connected successfully to PostgreSQL at db.heikbrdhbojeetopiakz.supabase.co!');
        console.log('[Database] Checking if tables exist in public schema...');
        
        const checkTablesQuery = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name IN ('tasks', 'task_completions');
        `;
        const existingResult = await client.query(checkTablesQuery);
        const existingTableNames = existingResult.rows.map(r => r.table_name);
        console.log(`[Database] Existing tables: ${existingTableNames.length > 0 ? existingTableNames.join(', ') : 'none'}`);

        // Read and execute safe idempotent schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('[Database] Executing automatic table creation / migration (CREATE TABLE IF NOT EXISTS)...');
        await client.query(schemaSql);

        // Verify tables exist now
        const verifyResult = await client.query(checkTablesQuery);
        const verifiedTableNames = verifyResult.rows.map(r => r.table_name);
        console.log(`[Database] Verified PostgreSQL tables: ${verifiedTableNames.join(', ')}`);
        console.log('[Database] Supabase PostgreSQL initialization complete! Zero sample data.');

        return { connected: true, driver: 'pg', tables: verifiedTableNames };
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[Database] PostgreSQL connection error:', err.message);
      console.log('[Database] Running with storage adapter until database password authentication completes.');
    }
  } else {
    console.log('[Database] Connection parameters configured (host=db.heikbrdhbojeetopiakz.supabase.co, port=5432, user=postgres).');
    console.log('[Database] Add PGPASSWORD=your_database_password (or DATABASE_URL=postgresql://postgres:[password]@db.heikbrdhbojeetopiakz.supabase.co:5432/postgres) to .env to connect live.');
  }

  return { connected: false, driver: 'store' };
}

// Allow standalone execution: node backend/database/initDatabase.js
if (process.argv[1] === __filename) {
  initDatabase().then(() => {
    process.exit(0);
  });
}
