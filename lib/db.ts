/**
 * PostgreSQL connection — lazy singleton.
 *
 * Uses the `pg` package (node-postgres). Install it with:
 *   npm install pg && npm install -D @types/pg
 *
 * Requires DATABASE_URL in .env (or POSTGRES_URL on Vercel).
 * The pool is created once per cold start and reused across requests.
 */
import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL (or POSTGRES_URL) environment variable is not set."
      );
    }

    pool = new Pool({
      connectionString,
      max: 10,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return pool;
}

/** Run a parameterised query and return typed rows. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query<T>(text, values);
  return rows;
}

/** Run a parameterised query and return the first row (or null). */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}
