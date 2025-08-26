

// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qknbnjvmfzhpwrsuepyg.supabase.co'; // Npr. 'https://your-project.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbmJuanZtZnpocHdyc3VlcHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTAxMjEsImV4cCI6MjA3MTc2NjEyMX0.WrB6bAjaD2bAMEOKRKWpW3UaD_LW5c7uK5Q5K14OF7A'; // Npr. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
export const supabase = createClient(supabaseUrl, supabaseKey);