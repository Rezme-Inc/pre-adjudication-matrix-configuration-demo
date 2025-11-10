-- Migration: Fix null look_back_period values
-- Updates all null look_back_period values to 0 in JSONB responses array

-- Update all responses in decisions_batch to replace null look_back_period with 0
UPDATE decisions_batch
  SET responses = (
    SELECT jsonb_agg(
      CASE
        WHEN elem->'look_back_period' = 'null'::jsonb
        THEN jsonb_set(elem, '{look_back_period}', '0'::jsonb)
        ELSE elem
      END
    )
    FROM jsonb_array_elements(responses) AS elem
  );

-- Optional: Rename submitted_by_name to username if needed for consistency
-- Only run this if username column doesn't already exist and you want to rename
-- Uncomment the following line if you want to apply this change:
-- ALTER TABLE decisions_batch RENAME COLUMN submitted_by_name TO username;

-- Optional: Drop recipient_emails if no longer used
-- Uncomment the following line if you want to apply this change:
-- ALTER TABLE decisions_batch DROP COLUMN IF EXISTS recipient_emails;
