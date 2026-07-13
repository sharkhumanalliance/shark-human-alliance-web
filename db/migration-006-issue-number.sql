-- Migration 006: sequential issue number for certificate collector lines.
--
-- Adds members.issue_number, backfills existing rows in issue order
-- (issue_date, then id as a stable tiebreaker), and wires a database sequence
-- so future INSERTs receive a number without application-side generation.
--
-- Safety properties:
--   - Runs atomically in one transaction.
--   - Locks members while the backfill, constraints, and sequence are aligned.
--   - Verifies migration 005 before changing the schema.
--   - Can be rerun after a successful execution.
--   - Refuses a partially populated pre-existing column instead of guessing.
--
-- PostgreSQL sequences are monotonic but not gapless: a rolled-back or failed
-- INSERT may consume a number. Existing rows are backfilled contiguously.

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';

DO $preconditions$
BEGIN
  IF to_regclass('public.members') IS NULL THEN
    RAISE EXCEPTION 'migration 006 aborted: public.members does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'members'
      AND column_name = 'registry_code'
      AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: migration 005 is not applied (members.registry_code must be NOT NULL)';
  END IF;
END
$preconditions$;

-- Prevent an INSERT from landing between the historical backfill and the
-- sequence/default setup. The lock is held only until this transaction commits.
LOCK TABLE public.members IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS issue_number INTEGER;

DO $column_shape$
DECLARE
  column_type text;
  has_numbered_rows boolean;
  has_unnumbered_rows boolean;
BEGIN
  SELECT data_type
  INTO column_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'members'
    AND column_name = 'issue_number';

  IF column_type IS DISTINCT FROM 'integer' THEN
    RAISE EXCEPTION 'migration 006 aborted: members.issue_number exists with unexpected type %', column_type;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE issue_number IS NOT NULL
  ) INTO has_numbered_rows;

  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE issue_number IS NULL
  ) INTO has_unnumbered_rows;

  IF has_numbered_rows AND has_unnumbered_rows THEN
    RAISE EXCEPTION 'migration 006 aborted: members.issue_number is partially populated; inspect the existing values before retrying';
  END IF;
END
$column_shape$;

WITH ordered_members AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY issue_date, id)::INTEGER AS assigned_number
  FROM public.members
)
UPDATE public.members AS members
SET issue_number = ordered_members.assigned_number
FROM ordered_members
WHERE members.id = ordered_members.id
  AND members.issue_number IS NULL;

DO $backfill_checks$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.members WHERE issue_number IS NULL
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: issue_number backfill left NULL values';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.members WHERE issue_number <= 0
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: issue_number must be positive';
  END IF;

  IF EXISTS (
    SELECT issue_number
    FROM public.members
    GROUP BY issue_number
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: duplicate issue_number values detected';
  END IF;
END
$backfill_checks$;

CREATE SEQUENCE IF NOT EXISTS public.members_issue_number_seq;

-- CREATE SEQUENCE IF NOT EXISTS does not repair ownership on a pre-existing
-- sequence, so set it explicitly on every run.
ALTER SEQUENCE public.members_issue_number_seq
  OWNED BY public.members.issue_number;

-- Align the next value with both the highest committed issue number and the
-- sequence's own high-water mark. This never moves the sequence backwards.
SELECT setval(
  'public.members_issue_number_seq'::regclass,
  GREATEST(
    COALESCE(
      (SELECT MAX(issue_number)::bigint + 1 FROM public.members),
      1
    ),
    (
      SELECT CASE
        WHEN is_called THEN last_value + 1
        ELSE last_value
      END
      FROM public.members_issue_number_seq
    )
  ),
  false
);

ALTER TABLE public.members
  ALTER COLUMN issue_number
    SET DEFAULT nextval('public.members_issue_number_seq'::regclass),
  ALTER COLUMN issue_number SET NOT NULL;

DO $positive_constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.members'::regclass
      AND conname = 'members_issue_number_positive'
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_issue_number_positive
      CHECK (issue_number > 0);
  END IF;
END
$positive_constraint$;

CREATE UNIQUE INDEX IF NOT EXISTS members_issue_number_key
  ON public.members (issue_number);

DO $final_checks$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'members'
      AND column_name = 'issue_number'
      AND is_nullable = 'NO'
      AND position('members_issue_number_seq' IN column_default) > 0
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: issue_number default or NOT NULL constraint is not configured';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.members'::regclass
      AND conname = 'members_issue_number_positive'
      AND convalidated
      AND position('issue_number > 0' IN pg_get_constraintdef(oid)) > 0
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: positive issue_number constraint is not configured';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_index
    WHERE indexrelid = to_regclass('public.members_issue_number_key')
      AND indrelid = 'public.members'::regclass
      AND indisunique
      AND indnkeyatts = 1
      AND pg_get_indexdef(indexrelid, 1, false) = 'issue_number'
  ) THEN
    RAISE EXCEPTION 'migration 006 aborted: members_issue_number_key is not the expected unique issue_number index';
  END IF;
END
$final_checks$;

COMMIT;
