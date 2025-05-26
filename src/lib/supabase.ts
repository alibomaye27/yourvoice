import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Record<string, unknown>) => {
  console.error('Supabase error:', error)
  return {
    error: (error.message as string) || 'An unexpected error occurred',
    code: (error.code as string) || 'UNKNOWN_ERROR'
  }
}
