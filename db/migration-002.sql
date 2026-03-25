-- Migration 002: Schema hardening
-- Run after migration-001 against your Postgres database.
--
-- Changes:
--   1. Convert issue_date from text → timestamptz
--   2. Add columns: template, locale
-- ────────────────────────────────────────────────────────

-- 1) issue_date: text → timestamptz
--    Existing text values like '2026-03-20' will be cast automatically.
ALTER TABLE members
  ALTER COLUMN issue_date TYPE timestamptz
  USING issue_date::timestamptz;

-- 2) New columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS template text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS locale   text;
