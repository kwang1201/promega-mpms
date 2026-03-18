import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://intdrqudnbsqhhdyfbos.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludGRycXVkbmJzcWhoZHlmYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDM2MzcsImV4cCI6MjA4OTM3OTYzN30.VvHwoEnhbxvUFuxwve8SP0GtQ6fTJgEw2VpxC8500SU'

const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
const envKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY

const supabaseUrl = (envUrl && envUrl.length > 0) ? envUrl : FALLBACK_URL
const supabaseAnonKey = (envKey && envKey.length > 0) ? envKey : FALLBACK_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
