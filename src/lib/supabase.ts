import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bampazkvljxutcvhpvjq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbXBhemt2bGp4dXRjdmhwdmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzQwMTYsImV4cCI6MjA3MjIxMDAxNn0.abc123def456';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;