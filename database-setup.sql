-- Create tables for AI Employment Coach Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  benefits TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  certifications_required TEXT[] DEFAULT '{}',
  vapi_squad_id TEXT,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  application_deadline DATE,
  interview_process JSONB NOT NULL DEFAULT '{"steps": []}'
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  resume_url TEXT,
  resume_text TEXT,
  cover_letter TEXT,
  certifications JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  education JSONB DEFAULT '[]',
  work_experience JSONB DEFAULT '[]',
  linkedin_url TEXT,
  portfolio_url TEXT,
  notes TEXT
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cover_letter_specific TEXT,
  source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'referral', 'job_board', 'social_media', 'other')),
  notes TEXT,
  screening_score NUMERIC(3,1) CHECK (screening_score >= 0 AND screening_score <= 10),
  fit_score NUMERIC(3,1) CHECK (fit_score >= 0 AND fit_score <= 10),
  rejection_reason TEXT,
  UNIQUE(job_id, candidate_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  vapi_call_id TEXT,
  phone_number_used TEXT,
  transcript TEXT,
  summary TEXT,
  scores JSONB DEFAULT '{}',
  feedback TEXT,
  next_steps TEXT,
  recording_url TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing

-- Sample job
INSERT INTO jobs (
  title,
  company,
  department,
  location,
  employment_type,
  experience_level,
  description,
  requirements,
  responsibilities,
  skills_required,
  certifications_required,
  benefits,
  vapi_squad_id,
  phone_number,
  interview_process
) VALUES (
  'Senior Ski Instructor',
  'MountainPass',
  'Ski School',
  'Whistler, BC',
  'full-time',
  'senior',
  'Join our elite team of ski instructors at MountainPass, one of the premier ski resorts in Whistler. We are looking for an experienced and passionate ski instructor who can provide exceptional instruction to skiers of all levels while embodying our commitment to safety, fun, and mountain culture.',
  ARRAY['PSIA Level 2 or higher certification', '5+ years of ski instruction experience', 'Fluent in English', 'Excellent communication skills', 'Physical fitness and outdoor enthusiasm'],
  ARRAY['Provide ski instruction to individuals and groups', 'Ensure student safety at all times', 'Adapt teaching methods to different skill levels', 'Maintain equipment and teaching areas', 'Participate in staff training and development'],
  ARRAY['Advanced skiing technique', 'Teaching and communication', 'Safety protocols', 'Customer service', 'Multilingual (preferred)'],
  ARRAY['PSIA Level 2', 'PSIA Level 3', 'CSIA Level 2'],
  ARRAY['Competitive salary', 'Season pass', 'Equipment discounts', 'Professional development', 'Health benefits'],
  'squad_123_example',
  '+1-555-SKI-PASS',
  '{"steps": [
    {
      "name": "Founder Screening",
      "agent_name": "MountainPass Founder",
      "duration_minutes": 15,
      "description": "Initial conversation with the company founder about passion for skiing and mountain culture"
    },
    {
      "name": "HR Screening",
      "agent_name": "HR Screener",
      "duration_minutes": 20,
      "description": "HR screening for culture fit, availability, and basic qualifications"
    },
    {
      "name": "Technical Interview",
      "agent_name": "Head Ski Instructor",
      "duration_minutes": 30,
      "description": "Technical skills assessment covering ski instruction methodology and safety protocols"
    }
  ]}'::jsonb
) ON CONFLICT DO NOTHING;

-- Sample candidate
INSERT INTO candidates (
  first_name,
  last_name,
  email,
  phone,
  skills,
  experience_years,
  certifications,
  education,
  work_experience,
  cover_letter
) VALUES (
  'Alex',
  'Johnson',
  'alex.johnson@email.com',
  '+1-555-123-4567',
  ARRAY['Advanced skiing', 'Teaching', 'Safety protocols', 'Customer service', 'French language'],
  8,
  '[
    {
      "name": "PSIA Level 3",
      "issuer": "Professional Ski Instructors of America",
      "date_obtained": "2020-03-15",
      "expiry_date": "2025-03-15",
      "credential_id": "PSIA-L3-2020-1234"
    },
    {
      "name": "CSIA Level 2",
      "issuer": "Canadian Ski Instructors Alliance",
      "date_obtained": "2019-12-10",
      "expiry_date": "2024-12-10",
      "credential_id": "CSIA-L2-2019-5678"
    }
  ]'::jsonb,
  '[
    {
      "institution": "University of Vermont",
      "degree": "Bachelor of Science",
      "field_of_study": "Exercise Science",
      "graduation_year": 2018,
      "gpa": 3.7
    }
  ]'::jsonb,
  '[
    {
      "company": "Aspen Snowmass",
      "position": "Senior Ski Instructor",
      "start_date": "2019-11-01",
      "end_date": "2024-04-15",
      "description": "Provided ski instruction to advanced and expert skiers, led instructor training programs, and managed seasonal staff development.",
      "is_current": false
    },
    {
      "company": "Vail Resorts",
      "position": "Ski Instructor",
      "start_date": "2018-12-01",
      "end_date": "2019-10-30",
      "description": "Taught skiing to beginners through intermediate levels, maintained safety standards, and participated in guest services.",
      "is_current": false
    }
  ]'::jsonb,
  'I am thrilled to apply for the Senior Ski Instructor position at MountainPass. With over 8 years of experience in ski instruction and advanced certifications from both PSIA and CSIA, I bring a deep passion for skiing and teaching that aligns perfectly with your resort''s commitment to excellence. My experience at top-tier resorts like Aspen Snowmass has prepared me to deliver exceptional instruction while ensuring the highest safety standards.'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- These are basic policies - you should customize based on your authentication setup

CREATE POLICY "Enable read access for all users" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON jobs FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON candidates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON candidates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON candidates FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON applications FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON interviews FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON interviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON interviews FOR UPDATE USING (auth.role() = 'authenticated'); 