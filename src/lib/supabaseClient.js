import { createClient } from '@supabase/supabase-js';

function readTrimmedEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSupabaseUrl(value) {
  const trimmed = readTrimmedEnvValue(value);
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

const rawSupabaseUrl = readTrimmedEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = readTrimmedEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (rawSupabaseUrl && !supabaseUrl) {
  console.warn('ShopOra: VITE_SUPABASE_URL must be a valid http(s) URL. Supabase features are disabled and the app will use local/demo mode.');
}

if (rawSupabaseUrl && supabaseUrl && !supabaseAnonKey) {
  console.warn('ShopOra: VITE_SUPABASE_ANON_KEY is missing. Supabase features are disabled and the app will use local/demo mode.');
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export { supabaseUrl, supabaseAnonKey };

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
