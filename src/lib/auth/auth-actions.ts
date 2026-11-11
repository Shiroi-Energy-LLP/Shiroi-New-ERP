"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fail, type ActionResult } from "@/lib/types/actions";

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

/** Only allow same-site relative redirects after login. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const op = "[signIn]";
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return fail("Check the highlighted fields", fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    console.error(op, { email: parsed.data.email, error: error.message, timestamp: new Date().toISOString() });
    return fail("Wrong email or password");
  }

  redirect(safeNext(parsed.data.next));
}

export async function signOut(): Promise<void> {
  const op = "[signOut]";
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.error(op, { error: error.message, timestamp: new Date().toISOString() });
  redirect("/login");
}

const passwordSchema = z
  .object({
    password: z.string().min(10, "At least 10 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

export async function changePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const op = "[changePassword]";
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return fail("Check the highlighted fields", fieldErrors);
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error(op, { error: error.message, timestamp: new Date().toISOString() });
    return fail(error.message.includes("different") ? "Choose a password different from the current one" : "Couldn't change the password");
  }
  return { ok: true, data: null };
}
