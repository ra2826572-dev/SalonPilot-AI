import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getServerSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error('Failed to initialize server-side Supabase client:', err);
    return null;
  }
}

export function checkSupabaseServerStatus(): {
  configured: boolean;
  url: string | null;
  hasServiceRoleKey: boolean;
  hasAnonKey: boolean;
} {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

  return {
    configured: Boolean(url && (hasServiceRoleKey || hasAnonKey)),
    url: url ? url.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
    hasServiceRoleKey,
    hasAnonKey
  };
}
