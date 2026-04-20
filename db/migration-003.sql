-- Migration 003: Privacy, consent, and moderation fields
-- Run after migration-002 against your Postgres database.

ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_version text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS digital_content_consent_at timestamptz;
ALTER TABLE members ADD COLUMN IF NOT EXISTS digital_content_version text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS registry_visibility text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS dedication_review_status text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS erased_at timestamptz;

UPDATE members
SET registry_visibility = 'public'
WHERE registry_visibility IS NULL;

UPDATE members
SET dedication_review_status = 'approved'
WHERE dedication_review_status IS NULL;

ALTER TABLE members
  ALTER COLUMN registry_visibility SET DEFAULT 'private',
  ALTER COLUMN registry_visibility SET NOT NULL;

ALTER TABLE members
  ALTER COLUMN dedication_review_status SET DEFAULT 'approved',
  ALTER COLUMN dedication_review_status SET NOT NULL;

