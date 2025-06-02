import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key length:', supabaseAnonKey?.length)

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service key) - only for server-side operations
let serverSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getServerSupabase() {
  if (!serverSupabase) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
    
    if (!supabaseServiceKey) {
      throw new Error('Missing env.SUPABASE_SERVICE_KEY - required for server-side operations')
    }
    
    serverSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }
  
  return serverSupabase
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Record<string, unknown>) => {
  console.error('Supabase error:', error)
  return {
    error: (error.message as string) || 'An unexpected error occurred',
    code: (error.code as string) || 'UNKNOWN_ERROR'
  }
}
