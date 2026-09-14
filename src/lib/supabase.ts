import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hrhudubhmazqevnrfsmo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaHVkdWJobWF6cWV2bnJmc21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzI1MzIsImV4cCI6MjEwNDkwODUzMn0.IOBJa5_UaEsloS7KJir7bJLqk_jfnGgRKegfr6RgxYg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
