-- Simple migration to create new jsonb fields for resume and cover_letter
-- This will replace: resume_url (text), resume_text (jsonb), cover_letter (text)
-- With: resume (jsonb), cover_letter (jsonb)

-- Backup existing data (optional - remove if you don't need it)
-- ALTER TABLE candidates ADD COLUMN backup_resume_text jsonb;
-- ALTER TABLE candidates ADD COLUMN backup_cover_letter text;
-- UPDATE candidates SET backup_resume_text = resume_text WHERE resume_text IS NOT NULL;
-- UPDATE candidates SET backup_cover_letter = cover_letter WHERE cover_letter IS NOT NULL;

-- Drop old columns
ALTER TABLE candidates DROP COLUMN IF EXISTS resume_url;
ALTER TABLE candidates DROP COLUMN IF EXISTS resume_text; 
ALTER TABLE candidates DROP COLUMN IF EXISTS cover_letter;

-- Add new jsonb columns
ALTER TABLE candidates ADD COLUMN resume jsonb;
ALTER TABLE candidates ADD COLUMN cover_letter jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_resume_type ON candidates USING GIN ((resume->>'type'));
CREATE INDEX IF NOT EXISTS idx_candidates_cover_letter_type ON candidates USING GIN ((cover_letter->>'type')); 