import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Service Key length:', supabaseServiceKey?.length)

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseServiceKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Record<string, unknown>) => {
  console.error('Supabase error:', error)
  return {
    error: (error.message as string) || 'An unexpected error occurred',
    code: (error.code as string) || 'UNKNOWN_ERROR'
  }
}
