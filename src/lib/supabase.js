import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lonftqgiunxnyaffvqxi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbmZ0cWdpdW54bnlhZmZ2cXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDA0NTUsImV4cCI6MjA5MjIxNjQ1NX0.gVb3KA4_-21_CUOjV1wMc1TIDLBKuB0vQZsCFWchCXs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
