import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Provide a dummy fallback so `next build` doesn't crash if env var is missing during build step
const sql = neon(process.env.DATABASE_URL || "postgres://dummy:dummy@dummy.com/dummy");
export const db = drizzle(sql);
