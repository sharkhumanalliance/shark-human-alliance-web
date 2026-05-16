-- Migration 005: Require public registry codes
-- Run after migration-004 and after the registry-code application deploy is live.
--
-- This hardens the public registry code column now that checkout/webhook flows
-- generate registry_code for every new member.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM members
    WHERE registry_code IS NULL
  ) THEN
    RAISE EXCEPTION 'registry_code contains NULL values; run migration-004 backfill before setting NOT NULL';
  END IF;
END $$;

ALTER TABLE members
  ALTER COLUMN registry_code SET NOT NULL;
