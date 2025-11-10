-- Migration: Add resume support for decisions_batch
-- Adds completed flag and unique username constraint to enable progress tracking

-- Step 1: Clean up duplicate usernames (keep most recent per username)
-- This ensures we can add a unique constraint
DELETE FROM decisions_batch a
USING decisions_batch b
WHERE a.batch_id < b.batch_id
  AND a.username = b.username;

-- Step 2: Add completed column to track if user finished all questions
ALTER TABLE decisions_batch
ADD COLUMN completed BOOLEAN DEFAULT FALSE;

-- Step 3: Add unique constraint on username
-- This prevents duplicate submissions and enables resume functionality
ALTER TABLE decisions_batch
ADD CONSTRAINT decisions_batch_username_unique UNIQUE (username);

-- Optional: Mark existing records as completed (uncomment if desired)
-- Since these records are already in the DB, they were likely submitted
-- UPDATE decisions_batch SET completed = TRUE WHERE completed = FALSE;
