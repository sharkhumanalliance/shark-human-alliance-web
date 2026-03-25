-- Migration 001: Create members table
-- Run once against your Postgres database (e.g. Neon, Supabase, Vercel Postgres).

create table if not exists members (
  id                text        primary key,
  name              text        not null,
  tier              text        not null,
  issue_date        timestamptz not null default now(),
  dedication        text        not null default '',
  referral_code     text        not null unique,
  referred_by       text,
  referral_count    integer     not null default 0,
  email             text,
  stripe_session_id text        unique,
  access_token      text        unique,
  template          text,
  locale            text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes for hot lookup paths
create index if not exists idx_members_access_token      on members (access_token);
create index if not exists idx_members_stripe_session_id on members (stripe_session_id);
create index if not exists idx_members_referral_code     on members (referral_code);
