// Browser Supabase client. Uses the publishable key; Row Level Security protects the data.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient<Database>(publicEnv.supabaseUrl(), publicEnv.supabasePublishableKey());
}
