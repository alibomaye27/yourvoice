-- Additional Jobs Migration for MountainPass
-- Run this in Supabase SQL Editor to add more sample jobs

-- Job 1: Ski Patrol Officer
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
  salary_range_min,
  salary_range_max,
  vapi_squad_id,
  phone_number,
  application_deadline,
  interview_process
) VALUES (
  'Ski Patrol Officer',
  'MountainPass',
  'Mountain Safety',
  'Whistler, BC',
  'full-time',
  'mid',
  'Join our elite Ski Patrol team at MountainPass and help ensure the safety of thousands of skiers and snowboarders daily. As a Ski Patrol Officer, you''ll be responsible for mountain safety, emergency response, and providing first aid in challenging alpine conditions. This is a critical role that requires quick thinking, advanced skiing skills, and medical training.',
  ARRAY[
    'EMT or Paramedic certification required',
    'Advanced skiing/snowboarding proficiency',
    'Avalanche Level 1 certification (Level 2 preferred)',
    '3+ years mountain rescue or emergency response experience',
    'Physical fitness for high-altitude rescue operations',
    'Excellent communication and decision-making skills',
    'Ability to work in extreme weather conditions'
  ],
  ARRAY[
    'Conduct daily mountain safety assessments',
    'Respond to ski accidents and medical emergencies',
    'Perform alpine rescues using specialized equipment',
    'Monitor weather and avalanche conditions',
    'Maintain and operate patrol equipment',
    'Educate guests on mountain safety',
    'Coordinate with emergency services',
    'Document incidents and maintain safety records'
  ],
  ARRAY[
    'Expert skiing/snowboarding',
    'Emergency medical response',
    'Alpine rescue techniques',
    'Avalanche safety',
    'Radio communication',
    'Risk assessment',
    'Leadership under pressure',
    'Weather interpretation'
  ],
  ARRAY[
    'EMT-B or higher',
    'Avalanche Level 1',
    'CPR/AED',
    'Wilderness First Responder (WFR)',
    'Avalanche Level 2 (preferred)'
  ],
  ARRAY[
    'Competitive salary $55,000-$75,000',
    'Full health and dental coverage',
    'Season pass and family benefits',
    'Professional development opportunities',
    'Equipment allowance',
    'Retirement savings plan',
    'Emergency response training'
  ],
  55000,
  75000,
  'squad_patrol_456',
  '+1-555-PATROL-1',
  '2025-06-15',
  '{"steps": [
    {
      "name": "Initial Screening",
      "agent_name": "Mountain Safety Director",
      "duration_minutes": 20,
      "description": "Initial assessment of emergency response experience and motivation for mountain safety work"
    },
    {
      "name": "Technical Assessment",
      "agent_name": "Senior Patrol Officer",
      "duration_minutes": 25,
      "description": "Technical skills evaluation covering medical response, avalanche safety, and rescue scenarios"
    },
    {
      "name": "Leadership Interview",
      "agent_name": "Patrol Operations Manager",
      "duration_minutes": 30,
      "description": "Assessment of leadership skills, decision-making under pressure, and team collaboration"
    }
  ]}'::jsonb
);

-- Job 2: Guest Services Manager
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
  salary_range_min,
  salary_range_max,
  vapi_squad_id,
  phone_number,
  application_deadline,
  interview_process
) VALUES (
  'Guest Services Manager',
  'MountainPass',
  'Guest Experience',
  'Whistler, BC',
  'full-time',
  'mid',
  'Lead the Guest Services team at MountainPass and create exceptional experiences for our visitors from around the world. As Guest Services Manager, you''ll oversee all guest-facing operations including ticket sales, information services, and guest relations. You''ll be the face of MountainPass, ensuring every guest leaves with unforgettable memories of their mountain experience.',
  ARRAY[
    'Bachelor''s degree in Hospitality, Business, or related field',
    '5+ years in guest services or hospitality management',
    'Proven leadership and team management experience',
    'Excellent communication skills in English (multilingual preferred)',
    'Experience with POS systems and reservation software',
    'Strong problem-solving and conflict resolution skills',
    'Flexible schedule including weekends and holidays'
  ],
  ARRAY[
    'Manage daily guest services operations',
    'Lead and develop a team of 15+ guest services representatives',
    'Handle escalated guest complaints and concerns',
    'Oversee ticket sales and season pass operations',
    'Coordinate with other departments for seamless guest experience',
    'Analyze guest feedback and implement improvements',
    'Manage guest services budget and staffing',
    'Train staff on customer service excellence',
    'Develop and implement guest service policies'
  ],
  ARRAY[
    'Leadership and team management',
    'Customer service excellence',
    'Conflict resolution',
    'Multi-language communication',
    'POS and reservation systems',
    'Budget management',
    'Staff training and development',
    'Problem-solving',
    'Performance analytics'
  ],
  ARRAY[
    'Hospitality Management Certification (preferred)',
    'First Aid/CPR (preferred)',
    'Customer Service Excellence Certification'
  ],
  ARRAY[
    'Competitive salary $60,000-$80,000',
    'Performance-based bonuses',
    'Comprehensive health benefits',
    'Season pass and family benefits',
    'Professional development budget',
    'Retirement savings plan',
    'Employee discounts resort-wide',
    'Flexible PTO policy'
  ],
  60000,
  80000,
  'squad_guest_789',
  '+1-555-GUEST-99',
  '2025-05-20',
  '{"steps": [
    {
      "name": "Culture Fit Assessment",
      "agent_name": "HR Business Partner",
      "duration_minutes": 15,
      "description": "Assessment of alignment with MountainPass values and guest-first mentality"
    },
    {
      "name": "Leadership Interview",
      "agent_name": "Operations Director",
      "duration_minutes": 25,
      "description": "Evaluation of leadership experience, team management skills, and operational thinking"
    },
    {
      "name": "Scenario-Based Assessment",
      "agent_name": "Guest Experience Director",
      "duration_minutes": 30,
      "description": "Role-playing scenarios for handling difficult guests, staff conflicts, and operational challenges"
    }
  ]}'::jsonb
);

-- Add one more candidate for testing
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
  'Sarah',
  'Chen',
  'sarah.chen@email.com',
  '+1-555-987-6543',
  ARRAY['Customer service', 'Team leadership', 'Conflict resolution', 'Multilingual (English, French, Mandarin)', 'Hospitality management'],
  6,
  '[
    {
      "name": "Certified Hospitality Manager",
      "issuer": "American Hotel & Lodging Association",
      "date_obtained": "2021-08-20",
      "expiry_date": "2026-08-20",
      "credential_id": "CHM-2021-9876"
    },
    {
      "name": "Customer Service Excellence",
      "issuer": "Institute of Customer Service",
      "date_obtained": "2020-05-15",
      "expiry_date": "2025-05-15",
      "credential_id": "CSE-2020-5432"
    }
  ]'::jsonb,
  '[
    {
      "institution": "University of British Columbia",
      "degree": "Bachelor of Commerce",
      "field_of_study": "Hospitality and Tourism Management",
      "graduation_year": 2019,
      "gpa": 3.8
    }
  ]'::jsonb,
  '[
    {
      "company": "Fairmont Chateau Whistler",
      "position": "Guest Relations Supervisor",
      "start_date": "2021-06-01",
      "end_date": "2024-11-30",
      "description": "Supervised a team of 12 guest relations staff, managed VIP guest services, and maintained 95% guest satisfaction rating.",
      "is_current": false
    },
    {
      "company": "Pan Pacific Vancouver",
      "position": "Front Desk Agent",
      "start_date": "2019-09-01",
      "end_date": "2021-05-31",
      "description": "Provided exceptional customer service, handled reservations, and assisted with guest inquiries in multiple languages.",
      "is_current": false
    }
  ]'::jsonb,
  'I am excited to apply for the Guest Services Manager position at MountainPass. With over 6 years of hospitality experience and a proven track record of leading high-performing teams, I am passionate about creating memorable guest experiences. My multilingual abilities and deep understanding of mountain resort operations make me an ideal fit for your diverse guest base. I am eager to bring my expertise in guest relations and team leadership to help MountainPass continue its reputation for exceptional service.'
); 