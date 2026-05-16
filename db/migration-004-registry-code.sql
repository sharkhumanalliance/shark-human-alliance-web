-- Migration 004: Public registry codes
-- Run after migration-003 against your Postgres database.
--
-- Purpose:
--   Introduce a human-facing public registry code so public verification links
--   and registry UI do not need to expose the internal UUID-style member id.
--
-- This is stage 1 only:
--   - Adds and backfills registry_code for existing rows.
--   - Adds a unique index.
--   - Does NOT make registry_code NOT NULL yet, so an older deployed app can
--     keep inserting rows safely until the registry-code app deploy is live.

ALTER TABLE members ADD COLUMN IF NOT EXISTS registry_code text;

UPDATE members
SET registry_code =
  'SHA-' ||
  upper(substr(md5(id), 1, 4)) ||
  '-' ||
  upper(substr(md5(id), 5, 4))
WHERE registry_code IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT registry_code
    FROM members
    WHERE registry_code IS NOT NULL
    GROUP BY registry_code
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'registry_code collision detected; resolve duplicates before creating the unique index';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_registry_code
  ON members (registry_code);
