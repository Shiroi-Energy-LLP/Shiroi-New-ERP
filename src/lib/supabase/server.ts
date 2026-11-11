// Server Supabase client for Server Components, Server Actions and Route Handlers.
// Acts as the signed-in user (cookies), so Row Level Security applies.
import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  // Supabase reads the clock (session expiry) and the user's cookies: always render this per request,
  // never into a prerendered/prefetched shell (Cache Components).
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl(), publicEnv.supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled by proxy.ts once auth is added.
        }
      },
    },
  });
}
