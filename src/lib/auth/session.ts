import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole | null;
  isActive: boolean;
};

/** The signed-in user and their profile. Request-scoped (React cache), never shared across requests. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const op = "[getCurrentUser]";
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError) {
    console.error(op, { error: claimsError, timestamp: new Date().toISOString() });
    return null;
  }
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(op, { userId, error, timestamp: new Date().toISOString() });
    return null;
  }
  if (!profile) {
    return { id: userId, email: String(claimsData.claims.email ?? ""), fullName: "", role: null, isActive: false };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
  };
});

/** For pages: an active staff member, or redirect to /login or /pending. */
export async function requireStaff(): Promise<CurrentUser & { role: AppRole }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isActive || !user.role) redirect("/pending");
  return user as CurrentUser & { role: AppRole };
}
