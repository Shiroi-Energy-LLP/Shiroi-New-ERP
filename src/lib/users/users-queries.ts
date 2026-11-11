import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type StaffUser = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "email" | "phone" | "role" | "is_active" | "created_at"
>;

export async function listUsers(): Promise<StaffUser[]> {
  const op = "[listUsers]";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("full_name")
    .range(0, 499);
  if (error) {
    console.error(op, { error, timestamp: new Date().toISOString() });
    return [];
  }
  return data ?? [];
}
