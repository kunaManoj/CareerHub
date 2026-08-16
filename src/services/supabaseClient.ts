/**
 * Supabase client bootstrap — the single backend for CareerHub.
 *
 * Configuration is decided once at boot from two Vite env vars:
 *   VITE_SUPABASE_URL       — your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY  — the public anon key (safe to ship to clients)
 *
 * If both are present the client connects to your real Postgres database.
 * If either is missing, `isSupabaseConfigured` is false and the UI shows a
 * setup screen instead of the board — CareerHub never falls back to fake or
 * stale local data.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
