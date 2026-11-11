"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { CAN_MANAGE_USERS, hasRole } from "@/lib/roles";
import { zodFieldErrors } from "@/lib/crm/lead-schema";
import { fail, type ActionResult } from "@/lib/types/actions";
import { Constants } from "@/types/database";

type FormState = ActionResult | null;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isActive || !hasRole(user.role, CAN_MANAGE_USERS)) return null;
  return user;
}

const updateSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  role: z.union([z.enum(Constants.public.Enums.app_role), z.literal("")]).transform((v) => (v ? v : null)),
  is_active: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});

export async function updateUser(userId: string, _prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[updateUser]";
  const admin = await requireAdmin();
  if (!admin) return fail("Only admins can change users");

  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));
  if (parsed.data.is_active && !parsed.data.role) return fail("Pick a role before activating", { role: "Pick a role" });
  if (userId === admin.id && (!parsed.data.is_active || parsed.data.role !== admin.role)) {
    return fail("You can't deactivate yourself or change your own role");
  }

  // Normal client: the profiles_update_admin RLS policy enforces admin rights again.
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update(parsed.data).eq("id", userId).select("id");
  if (error) {
    console.error(op, { adminId: admin.id, userId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't save. Please try again.");
  }
  if (!data || data.length === 0) return fail("User not found");

  refresh();
  return { ok: true, data: null };
}

const createSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  role: z.enum(Constants.public.Enums.app_role, "Pick a role"),
  password: z.string().min(10, "At least 10 characters"),
});

/** ADMIN/SYSTEM OPERATION: creates an auth user with the secret key (bypasses RLS). Admin-only. */
export async function createUser(_prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[createUser]";
  const admin = await requireAdmin();
  if (!admin) return fail("Only admins can add users");

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));

  const adminClient = createAdminClient();
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });
  if (createError || !created?.user) {
    console.error(op, { adminId: admin.id, error: createError?.message, timestamp: new Date().toISOString() });
    const exists = createError?.message?.toLowerCase().includes("already");
    return fail(exists ? "A user with that email already exists" : "Couldn't create the user. Please try again.");
  }

  // The auth trigger created the profile (inactive). Give it the role and activate it.
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.role, is_active: true, full_name: parsed.data.full_name })
    .eq("id", created.user.id);
  if (profileError) {
    console.error(op, { adminId: admin.id, userId: created.user.id, error: profileError, timestamp: new Date().toISOString() });
    return fail("User created, but setting the role failed. Set it in the list below.");
  }

  refresh();
  return { ok: true, data: null };
}
