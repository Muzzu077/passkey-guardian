-- DROP EXISTING TABLES (CAUTION: THIS WILL DELETE ALL DATA)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS recovery_codes;
DROP TABLE IF EXISTS authenticators;
DROP TABLE IF EXISTS users;

-- Create users table
create table users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  created_at timestamptz default now()
);

-- Create authenticators table
create table authenticators (
  credential_id text primary key,
  user_id uuid references users(id) on delete cascade,
  public_key text not null,
  counter bigint default 0,
  transports jsonb,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table users enable row level security;
alter table authenticators enable row level security;

-- Policies
-- Allow public access for this demo (since we handle auth via backend)
create policy "Allow all operations for anon" on users for all using (true) with check (true);
create policy "Allow all operations for anon" on authenticators for all using (true) with check (true);

-- Phase 2: Recovery Codes
create table if not exists recovery_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  code_hash text not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- Phase 2: Audit Logs
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- RLS for Phase 2
alter table recovery_codes enable row level security;
alter table audit_logs enable row level security;

create policy "Allow all operations for anon" on recovery_codes for all using (true) with check (true);
create policy "Allow all operations for anon" on audit_logs for all using (true) with check (true);

-- Phase 3: Enhanced Authenticator Metadata
-- Run this manually in Supabase SQL Editor if columns don't exist
alter table authenticators add column if not exists friendly_name text;
alter table authenticators add column if not exists last_used timestamptz;
alter table authenticators add column if not exists revoked boolean default false;
-- Optional: AAGUID
alter table authenticators add column if not exists aaguid text;
