// Admin Supabase client. Uses the SECRET key and BYPASSES Row Level Security.
// Server only, and only for clearly labelled admin/system operations (CLAUDE.md NEVER DO #2).
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("[env] Missing environment variable SUPABASE_SECRET_KEY. See .env.example.");
  }
  return createClient<Database>(publicEnv.supabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
