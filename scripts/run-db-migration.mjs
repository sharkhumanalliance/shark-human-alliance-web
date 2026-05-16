import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  const [, , migrationPathArg, envPathArg] = process.argv;
  if (!migrationPathArg) {
    throw new Error("Usage: node scripts/run-db-migration.mjs <migration.sql> [env-file]");
  }

  const envPath = envPathArg || ".env.local";
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath);
  }

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_POSTGRES_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL or equivalent Postgres connection string");
  }

  const migrationPath = path.resolve(migrationPathArg);
  const sql = fs.readFileSync(migrationPath, "utf8");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    const result = await client.query(`
      SELECT
        count(*)::int AS total_members,
        count(registry_code)::int AS members_with_registry_code
      FROM members
      WHERE erased_at IS NULL
    `);

    console.log("MIGRATION_OK");
    console.log(`TOTAL_MEMBERS=${result.rows[0].total_members}`);
    console.log(`WITH_REGISTRY_CODE=${result.rows[0].members_with_registry_code}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("MIGRATION_FAILED");
  console.error(error.message);
  process.exit(1);
});
