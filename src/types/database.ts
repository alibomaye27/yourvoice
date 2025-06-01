export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          company: string
          department: string
          location: string
          employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'executive'
          description: string
          requirements: string[]
          responsibilities: string[]
          salary_range_min?: number
          salary_range_max?: number
          benefits?: string[]
          skills_required: string[]
          certifications_required?: string[]
          vapi_squad_id?: string
          phone_number?: string
          is_active: boolean
          application_deadline?: string
          interview_process: {
            steps: Array<{
              name: string
              agent_name: string
              duration_minutes: number
              description: string
            }>
          }
          ai_interview_enabled?: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          company: string
          department: string
          location: string
          employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'executive'
          description: string
          requirements: string[]
          responsibilities: string[]
          salary_range_min?: number
          salary_range_max?: number
          benefits?: string[]
          skills_required: string[]
          certifications_required?: string[]
          vapi_squad_id?: string
          phone_number?: string
          is_active?: boolean
          application_deadline?: string
          interview_process: {
            steps: Array<{
              name: string
              agent_name: string
              duration_minutes: number
              description: string
            }>
          }
          ai_interview_enabled?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          company?: string
          department?: string
          location?: string
          employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
          description?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_range_min?: number
          salary_range_max?: number
          benefits?: string[]
          skills_required?: string[]
          certifications_required?: string[]
          vapi_squad_id?: string
          phone_number?: string
          is_active?: boolean
          application_deadline?: string
          interview_process?: {
            steps: Array<{
              name: string
              agent_name: string
              duration_minutes: number
              description: string
            }>
          }
          ai_interview_enabled?: boolean
        }
      }
      candidates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          phone: string
          resume_url?: string
          resume_text?: string
          cover_letter?: string
          certifications: Array<{
            name: string
            issuer: string
            date_obtained: string
            expiry_date?: string
            credential_id?: string
          }>
          skills: string[]
          experience_years?: number
          education: Array<{
            institution: string
            degree: string
            field_of_study: string
            graduation_year: number
            gpa?: number
          }>
          work_experience: Array<{
            company: string
            position: string
            start_date: string
            end_date?: string
            description: string
            is_current: boolean
          }>
          linkedin_url?: string
          portfolio_url?: string
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          resume_url?: string
          resume_text?: string
          cover_letter?: string
          certifications?: Array<{
            name: string
            issuer: string
            date_obtained: string
            expiry_date?: string
            credential_id?: string
          }>
          skills?: string[]
          experience_years?: number
          education?: Array<{
            institution: string
            degree: string
            field_of_study: string
            graduation_year: number
            gpa?: number
          }>
          work_experience?: Array<{
            company: string
            position: string
            start_date: string
            end_date?: string
            description: string
            is_current: boolean
          }>
          linkedin_url?: string
          portfolio_url?: string
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          resume_url?: string
          resume_text?: string
          cover_letter?: string
          certifications?: Array<{
            name: string
            issuer: string
            date_obtained: string
            expiry_date?: string
            credential_id?: string
          }>
          skills?: string[]
          experience_years?: number
          education?: Array<{
            institution: string
            degree: string
            field_of_study: string
            graduation_year: number
            gpa?: number
          }>
          work_experience?: Array<{
            company: string
            position: string
            start_date: string
            end_date?: string
            description: string
            is_current: boolean
          }>
          linkedin_url?: string
          portfolio_url?: string
          notes?: string
        }
      }
      applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
          applied_at: string
          cover_letter_specific?: string
          source: 'direct' | 'referral' | 'job_board' | 'social_media' | 'other'
          notes?: string
          screening_score?: number
          fit_score?: number
          rejection_reason?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id: string
          candidate_id: string
          status?: 'applied' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
          applied_at?: string
          cover_letter_specific?: string
          source?: 'direct' | 'referral' | 'job_board' | 'social_media' | 'other'
          notes?: string
          screening_score?: number
          fit_score?: number
          rejection_reason?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id?: string
          candidate_id?: string
          status?: 'applied' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
          applied_at?: string
          cover_letter_specific?: string
          source?: 'direct' | 'referral' | 'job_board' | 'social_media' | 'other'
          notes?: string
          screening_score?: number
          fit_score?: number
          rejection_reason?: string
        }
      }
      interviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          application_id: string
          step_name: string
          agent_name: string
          scheduled_at?: string
          started_at?: string
          completed_at?: string
          duration_minutes?: number
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          vapi_call_id?: string
          phone_number_used?: string
          transcript?: string
          summary?: string
          scores: {
            technical_skills?: number
            communication?: number
            cultural_fit?: number
            enthusiasm?: number
            experience_relevance?: number
            overall?: number
          }
          feedback?: string
          next_steps?: string
          recording_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id: string
          step_name: string
          agent_name: string
          scheduled_at?: string
          started_at?: string
          completed_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          vapi_call_id?: string
          phone_number_used?: string
          transcript?: string
          summary?: string
          scores?: {
            technical_skills?: number
            communication?: number
            cultural_fit?: number
            enthusiasm?: number
            experience_relevance?: number
            overall?: number
          }
          feedback?: string
          next_steps?: string
          recording_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id?: string
          step_name?: string
          agent_name?: string
          scheduled_at?: string
          started_at?: string
          completed_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          vapi_call_id?: string
          phone_number_used?: string
          transcript?: string
          summary?: string
          scores?: {
            technical_skills?: number
            communication?: number
            cultural_fit?: number
            enthusiasm?: number
            experience_relevance?: number
            overall?: number
          }
          feedback?: string
          next_steps?: string
          recording_url?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Job = Database['public']['Tables']['jobs']['Row']
export type Candidate = Database['public']['Tables']['candidates']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Interview = Database['public']['Tables']['interviews']['Row']

export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type CandidateInsert = Database['public']['Tables']['candidates']['Insert']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type InterviewInsert = Database['public']['Tables']['interviews']['Insert']

export type JobUpdate = Database['public']['Tables']['jobs']['Update']
export type CandidateUpdate = Database['public']['Tables']['candidates']['Update']
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update']
export type InterviewUpdate = Database['public']['Tables']['interviews']['Update']
