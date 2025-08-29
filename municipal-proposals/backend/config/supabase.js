// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qknbnjvmfzhpwrsuepyg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbmJuanZtZnpocHdyc3VlcHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTAxMjEsImV4cCI6MjA3MTc2NjEyMX0.WrB6bAjaD2bAMEOKRKWpW3UaD_LW5c7uK5Q5K14OF7A';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };