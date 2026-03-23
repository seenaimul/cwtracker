import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing. Ensure they are set in your .env file.")
}

export const supabase = createClient(
  supabaseUrl || 'https://.supabase.co',
  supabaseAnonKey || '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlc2JmdWlmanJjbXJjemd1c2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDk0ODcsImV4cCI6MjA4OTY4NTQ4N30.2dWx9YfRZH8oWR704POwzuYTkF3MujSzsGzhkwwugLM'
)
