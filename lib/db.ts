/**
 * PostgreSQL connection — lazy singleton.
 *
 * Uses the `pg` package (node-postgres). Install it with:
 *   npm install pg && npm install -D @types/pg
 *
 * Requires DATABASE_URL in .env (or POSTGRES_URL on Vercel).
 * The pool is created once per cold start and reused across requests.
 */
import { Pool, type QueryResultRow, type PoolConfig } from "pg";

let pool: Pool | null = null;

function normalizeConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();

    // We provide TLS settings explicitly via the `ssl` option below.
    // Stripping legacy sslmode parameters avoids the pg-connection-string
    // compatibility warning seen in Vercel runtime logs.
    if (sslmode && ["prefer", "require", "verify-ca"].includes(sslmode)) {
      url.searchParams.delete("sslmode");
      url.searchParams.delete("uselibpqcompat");
      return url.toString();
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

function getSslConfig(): PoolConfig["ssl"] | undefined {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  return {
    rejectUnauthorized: false,
  };
}

function getPool(): Pool {
  if (!pool) {
    const rawConnectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!rawConnectionString) {
      throw new Error(
        "DATABASE_URL (or POSTGRES_URL) environment variable is not set."
      );
    }

    pool = new Pool({
      connectionString: normalizeConnectionString(rawConnectionString),
      max: 10,
      ssl: getSslConfig(),
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
