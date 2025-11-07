-- Migration: create interest_emails table
-- Run this in your Supabase SQL editor or via psql

create table if not exists interest_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  submitted_at timestamptz not null default now()
);

-- Create index on email for faster lookups
create index if not exists idx_interest_emails_email on interest_emails(email);

-- grant insert, select on interest_emails to authenticated;


