import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nozhmkjighefrsaduavr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vemhta2ppZ2hlZnJzYWR1YXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTkwNzMsImV4cCI6MjA4OTU3NTA3M30.CTVMoUBmlzwHsL58P1konl6R1sVdkHZRZC7U6Nlwu8o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
