-- Migration: create decisions_batch table
-- Run this in your Supabase SQL editor or via psql

create table if not exists decisions_batch (
  batch_id uuid primary key,
  submitted_by_name text not null,
  recipient_emails text[] not null,
  responses jsonb not null,
  submitted_at timestamptz not null default now()
);

-- grant insert, select on decisions_batch to authenticated;
