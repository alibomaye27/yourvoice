-- Migration to update candidates table schema
-- This handles the conversion of cover_letter from text to jsonb safely

-- First, create a backup of the existing cover_letter data
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_backup text;
UPDATE candidates SET cover_letter_backup = cover_letter WHERE cover_letter IS NOT NULL;

-- Add a new column for jsonb cover letter
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_jsonb jsonb;

-- Convert existing text cover letters to jsonb format
UPDATE candidates 
SET cover_letter_jsonb = jsonb_build_object(
  'type', 'text',
  'content', cover_letter,
  'uploaded_at', NOW()
) 
WHERE cover_letter IS NOT NULL AND cover_letter != '';

-- Drop the old text column (you may want to keep the backup for safety)
ALTER TABLE candidates DROP COLUMN IF EXISTS cover_letter;

-- Rename the jsonb column to cover_letter
ALTER TABLE candidates RENAME COLUMN cover_letter_jsonb TO cover_letter;

-- Update resume_text to jsonb if it's still text (seems like you already did this)
-- ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_text_jsonb jsonb;
-- UPDATE candidates SET resume_text_jsonb = jsonb_build_object('type', 'text', 'content', resume_text, 'uploaded_at', NOW()) WHERE resume_text IS NOT NULL;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS resume_text;
-- ALTER TABLE candidates RENAME COLUMN resume_text_jsonb TO resume_text;

-- Add any missing columns
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_url text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_file_name text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter_file_name text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_cover_letter_type ON candidates USING GIN ((cover_letter->>'type'));
CREATE INDEX IF NOT EXISTS idx_candidates_resume_type ON candidates USING GIN ((resume_text->>'type'));

-- Comment out the backup column drop for safety - uncomment when you're confident
-- ALTER TABLE candidates DROP COLUMN IF EXISTS cover_letter_backup; 