-- Simple storage setup - create bucket only
-- Run this in your Supabase SQL Editor

-- Create the bucket (simpler version)
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', true)
ON CONFLICT (id) DO NOTHING; 