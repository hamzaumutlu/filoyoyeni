import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

// Only create client if properly configured
let supabaseClient: SupabaseClient<Database> | null = null;

if (isSupabaseConfigured()) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('Supabase credentials not found. Running in demo mode.');
}

// Export null-safe supabase client
export const supabase = supabaseClient;
