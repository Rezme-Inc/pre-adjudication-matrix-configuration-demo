-- Migration: create decisions_batch table (FIXED VERSION)
-- Run this in your Supabase SQL editor or via psql
-- This version matches the actual code implementation

create table if not exists decisions_batch (
  batch_id uuid primary key,
  username text not null,           -- Changed from 'submitted_by_name' to match the code
  hierarchical_responses jsonb not null,
  submitted_at timestamptz not null default now()
);

-- Optional: Enable Row Level Security (RLS)
-- alter table decisions_batch enable row level security;

-- Optional: Create policy to allow authenticated users to insert their own data
-- create policy "Users can insert their own batches"
--   on decisions_batch for insert
--   with check (auth.uid()::text = username);

-- Optional: Create policy to allow users to read their own data
-- create policy "Users can view their own batches"
--   on decisions_batch for select
--   using (auth.uid()::text = username);

-- Create index for faster lookups by username
create index if not exists idx_decisions_batch_username on decisions_batch(username);

