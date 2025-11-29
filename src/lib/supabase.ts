import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://vtvmuvpahyifbzogxwnp.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dm11dnBhaHlpZmJ6b2d4d25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Nzk2MTUsImV4cCI6MjA2OTA1NTYxNX0.okkBygzdUqn4UjUvXdW9GzbAFGfrtpqQtFxpLPVXizc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
