import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://intdrqudnbsqhhdyfbos.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludGRycXVkbmJzcWhoZHlmYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDM2MzcsImV4cCI6MjA4OTM3OTYzN30.VvHwoEnhbxvUFuxwve8SP0GtQ6fTJgEw2VpxC8500SU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
