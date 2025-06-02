-- Storage setup for candidate documents
-- Run this in your Supabase SQL Editor

-- First, create the bucket if it doesn't exist (you can also do this via the dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents', 
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the candidate-documents bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'Allow public uploads to candidate-documents',
  'candidate-documents',
  'Allow public uploads',
  '(bucket_id = ''candidate-documents'')',
  '(bucket_id = ''candidate-documents'')',
  'INSERT'
)
ON CONFLICT (id) DO NOTHING;

-- Allow public downloads from the candidate-documents bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'Allow public downloads from candidate-documents',
  'candidate-documents',
  'Allow public downloads',
  '(bucket_id = ''candidate-documents'')',
  '(bucket_id = ''candidate-documents'')',
  'SELECT'
)
ON CONFLICT (id) DO NOTHING;

-- Allow public deletes from the candidate-documents bucket (optional)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'Allow public deletes from candidate-documents',
  'candidate-documents',
  'Allow public deletes',
  '(bucket_id = ''candidate-documents'')',
  '(bucket_id = ''candidate-documents'')',
  'DELETE'
)
ON CONFLICT (id) DO NOTHING; 