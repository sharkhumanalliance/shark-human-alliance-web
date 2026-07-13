# Handoff: run migration 006 (issue_number) — instructions for an AI operator with database access

You are operating on the production Postgres database of the Shark Human Alliance
project (Next.js app on Vercel; the same database the app reaches through the
`DATABASE_URL` environment variable). Your task is to apply one additive
migration and verify it. Nothing else.

## Context

- Table: `members` — one row per issued certificate. Relevant existing columns:
  `id` (uuid PK), `issue_date` (timestamptz), `registry_code` (text, NOT NULL
  since migration 005).
- Goal: add `issue_number` — a sequential collector number (1-based, ordered by
  `issue_date`, ties broken by `id`) printed on certificates as "No. N".
- The application code is already deployed to treat the column as optional:
  it renders the number only when present, and its INSERTs do not name the
  column, so the database default must supply values for new rows.

## Safety profile

- Purely additive: adds one column, backfills it, creates one sequence and one
  unique index. No data is deleted, updated destructively, or dropped.
- Idempotent: safe to run twice. The backfill only touches rows where
  `issue_number IS NULL`; DDL statements use `IF NOT EXISTS`.
- No application downtime required; deploy order does not matter.

## Preconditions (check before running)

```sql
-- 1. You are on the right database: the members table exists and is populated.
SELECT count(*) FROM members;

-- 2. Migration 005 has been applied (registry_code is NOT NULL):
SELECT is_nullable FROM information_schema.columns
WHERE table_name = 'members' AND column_name = 'registry_code';
-- expected: 'NO'
```

If either check fails, STOP and report back instead of proceeding.

## Execute

Run the full contents of `db/migration-006-issue-number.sql` from this
directory as a single script:

```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS issue_number INTEGER;

UPDATE members
SET issue_number = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY issue_date, id) AS rn
  FROM members
) sub
WHERE members.id = sub.id
  AND members.issue_number IS NULL;

CREATE SEQUENCE IF NOT EXISTS members_issue_number_seq OWNED BY members.issue_number;

SELECT setval(
  'members_issue_number_seq',
  COALESCE((SELECT MAX(issue_number) FROM members), 0) + 1,
  false
);

ALTER TABLE members
  ALTER COLUMN issue_number SET DEFAULT nextval('members_issue_number_seq');

CREATE UNIQUE INDEX IF NOT EXISTS members_issue_number_key
  ON members (issue_number);
```

## Verify (all three must pass)

```sql
-- A. Every row is numbered, numbers are unique, max equals row count:
SELECT count(*) AS members,
       count(issue_number) AS numbered,
       count(DISTINCT issue_number) AS distinct_numbers,
       max(issue_number) AS highest
FROM members;
-- expected: members = numbered = distinct_numbers = highest

-- B. The default is wired to the sequence:
SELECT column_default FROM information_schema.columns
WHERE table_name = 'members' AND column_name = 'issue_number';
-- expected: nextval('members_issue_number_seq'::regclass)

-- C. The sequence continues past the backfill:
SELECT last_value, is_called FROM members_issue_number_seq;
-- expected: last_value = highest + 1 (is_called = false), or > highest
```

Report the outputs of A–C verbatim.

## Guardrails

- Do NOT run any other DDL/DML, do not "clean up" unrelated objects, and do not
  vacuum/analyze/optimize anything.
- Do NOT insert test rows into `members`.
- Never print or persist the connection string.

## Rollback (only if explicitly requested)

```sql
ALTER TABLE members ALTER COLUMN issue_number DROP DEFAULT;
DROP INDEX IF EXISTS members_issue_number_key;
DROP SEQUENCE IF EXISTS members_issue_number_seq;
ALTER TABLE members DROP COLUMN IF EXISTS issue_number;
```
