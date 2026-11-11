import "server-only";
import { publicEnv } from "@/lib/env";

export type SupabaseHealth =
  | { ok: true; latencyMs: number }
  | { ok: false; error: string };

/** Checks that the app can reach the shiroi-erp2 Supabase project (auth service health endpoint). */
export async function getSupabaseHealth(): Promise<SupabaseHealth> {
  const op = "[getSupabaseHealth]";
  const started = Date.now();
  try {
    const res = await fetch(`${publicEnv.supabaseUrl()}/auth/v1/health`, {
      headers: { apikey: publicEnv.supabasePublishableKey() },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(op, { status: res.status, timestamp: new Date().toISOString() });
      return { ok: false, error: `Supabase responded with HTTP ${res.status}` };
    }
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    console.error(op, { error, timestamp: new Date().toISOString() });
    return { ok: false, error: "Could not reach Supabase" };
  }
}
