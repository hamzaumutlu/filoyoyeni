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
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
        global: {
            fetch: (url, options = {}) => {
                return fetch(url, {
                    ...options,
                    signal: options.signal || AbortSignal.timeout(10000),
                });
            },
        },
    });
} else {
    console.warn('Supabase credentials not found. Running in demo mode.');
}

// Export null-safe supabase client
export const supabase = supabaseClient;
