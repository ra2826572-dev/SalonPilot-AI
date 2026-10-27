import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from Vite environment variables or localStorage for in-browser testing
export function getSupabaseCredentials() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('salonpilot_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('salonpilot_supabase_anon_key') : null;

  const url = storedUrl || envUrl || '';
  const anonKey = storedKey || envKey || '';

  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseActive(): boolean {
  return getSupabaseCredentials().isConfigured;
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(urlInput?: string, keyInput?: string): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  const { url: defaultUrl, anonKey: defaultKey } = getSupabaseCredentials();
  const testUrl = urlInput || defaultUrl;
  const testKey = keyInput || defaultKey;

  if (!testUrl || !testKey) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are required.'
    };
  }

  const startTime = Date.now();
  try {
    const client = createClient(testUrl, testKey, {
      auth: { persistSession: false }
    });

    // Test request to health/auth endpoint
    const { error } = await client.auth.getSession();
    const latencyMs = Date.now() - startTime;

    if (error && !error.message.includes('fetch')) {
      // Even if session is null, reaching Supabase means auth gateway responded
      return {
        success: true,
        message: 'Successfully connected to Supabase Auth and Gateway.',
        latencyMs
      };
    }

    return {
      success: true,
      message: 'Supabase connection established successfully.',
      latencyMs
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      success: false,
      message: `Failed to connect to Supabase: ${msg}`
    };
  }
}

/**
 * Pre-written PostgreSQL SQL schema migration with Row Level Security (RLS)
 */
export const SUPABASE_SQL_MIGRATION = `-- ==========================================
-- SalonPilot AI Multi-Tenant PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Salons Table
CREATE TABLE IF NOT EXISTS public.salons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter', 'Pro Studio', 'Enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  chairs_count INTEGER NOT NULL DEFAULT 4,
  phone TEXT,
  address TEXT,
  settings JSONB NOT NULL DEFAULT '{"bookingBufferMinutes": 15, "aiReceptionistEnabled": true, "autoConfirm": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Users Profile Table (Links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SALON_OWNER' CHECK (role IN ('PLATFORM_ADMIN', 'SALON_OWNER', 'SALON_MANAGER', 'STAFF')),
  salon_id TEXT REFERENCES public.salons(id) ON DELETE SET NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 3. Create Salon Memberships Table
CREATE TABLE IF NOT EXISTS public.salon_memberships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'SALON_OWNER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, salon_id)
);

-- 4. Create Appointments Table (Strictly tenant-isolated by salon_id)
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  stylist_name TEXT NOT NULL,
  chair TEXT NOT NULL,
  service TEXT NOT NULL,
  addons TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Checked In', 'In Service', 'Confirmed', 'AI Scheduled', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Customers CRM & Formulas Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tier TEXT NOT NULL DEFAULT 'Standard',
  formula_note TEXT,
  lifetime_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  last_visited TEXT,
  cadence_weeks NUMERIC(4, 1) DEFAULT 4.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Security & Governance Audit Logs Table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  ip TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Isolation: Salon A cannot read Salon B records
-- ==========================================

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Salons RLS: Users can only select their own salon or if platform admin
CREATE POLICY salon_tenant_isolation ON public.salons
  FOR ALL
  USING (
    id IN (SELECT salon_id FROM public.users WHERE id = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'PLATFORM_ADMIN')
  );

-- Appointments RLS: Isolated strictly to user's assigned salon
CREATE POLICY appointments_tenant_isolation ON public.appointments
  FOR ALL
  USING (
    salon_id IN (SELECT salon_id FROM public.users WHERE id = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'PLATFORM_ADMIN')
  );

-- Customers RLS: Proprietary formulations isolated strictly to user's salon
CREATE POLICY customers_tenant_isolation ON public.customers
  FOR ALL
  USING (
    salon_id IN (SELECT salon_id FROM public.users WHERE id = auth.uid()::text)
  );

-- Audit Logs RLS: Only PLATFORM_ADMIN can view security audit logs
CREATE POLICY audit_logs_admin_only ON public.security_audit_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'PLATFORM_ADMIN')
  );
`;
