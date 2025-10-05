import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Debug: Log what SvelteKit is loading
console.log('=== SUPABASE CLIENT DEBUG ===')
console.log('PUBLIC_SUPABASE_URL from $env/static/public:', PUBLIC_SUPABASE_URL)
console.log('PUBLIC_SUPABASE_ANON_KEY from $env/static/public:', PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')

// Fallback values if environment variables are not loaded
const supabaseUrl = PUBLIC_SUPABASE_URL || 'https://alpzbhtmdlvaitvudare.supabase.co'
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscHpiaHRtZGx2YWl0dnVkYXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjgyNTIsImV4cCI6MjA3NDMwNDI1Mn0.WD5NrdFss6SEz3Bz1P3wE5dYxPWFBtmmi7fxrFT9mv4'

console.log('Using Supabase URL:', supabaseUrl)
console.log('Using Supabase Key:', supabaseAnonKey ? 'SET' : 'MISSING')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
