-- Migration: Add hierarchical_responses column to decisions_batch table
-- Run this in your Supabase SQL editor

-- Add hierarchical_responses column to store hierarchical workflow data
ALTER TABLE decisions_batch 
ADD COLUMN IF NOT EXISTS hierarchical_responses jsonb;

-- Ensure username column exists (should already exist from migration 005)
ALTER TABLE decisions_batch
ADD COLUMN IF NOT EXISTS username text;

-- Add submitted_by_name if it doesn't exist
ALTER TABLE decisions_batch
ADD COLUMN IF NOT EXISTS submitted_by_name text;

-- Add recipient_emails if it doesn't exist
ALTER TABLE decisions_batch
ADD COLUMN IF NOT EXISTS recipient_emails text[];

-- Make sure we can have either responses or hierarchical_responses (only if columns exist)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='decisions_batch' AND column_name='responses'
  ) THEN
    ALTER TABLE decisions_batch ALTER COLUMN responses DROP NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='decisions_batch' AND column_name='submitted_by_name'
  ) THEN
    ALTER TABLE decisions_batch ALTER COLUMN submitted_by_name DROP NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='decisions_batch' AND column_name='recipient_emails'
  ) THEN
    ALTER TABLE decisions_batch ALTER COLUMN recipient_emails DROP NOT NULL;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_decisions_batch_hierarchical 
ON decisions_batch USING gin (hierarchical_responses);

-- Drop existing check constraint if it exists before adding new one
ALTER TABLE decisions_batch DROP CONSTRAINT IF EXISTS check_responses_exist;

-- Add check constraint to ensure at least one response type exists
-- This will only work if both columns exist, so we check first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='decisions_batch' AND column_name='responses'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='decisions_batch' AND column_name='hierarchical_responses'
  ) THEN
    ALTER TABLE decisions_batch
    ADD CONSTRAINT check_responses_exist 
    CHECK (
      responses IS NOT NULL AND jsonb_array_length(responses) > 0
      OR
      hierarchical_responses IS NOT NULL AND jsonb_array_length(hierarchical_responses) > 0
    );
  END IF;
END $$;


