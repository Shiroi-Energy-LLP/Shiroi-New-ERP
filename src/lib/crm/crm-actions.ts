"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { parseDivision } from "@/lib/divisions";
import { formatDateTimeIST, fromISTInputValue } from "@/lib/format";
import { CAN_DELETE_LEADS, CAN_USE_CRM, hasRole } from "@/lib/roles";
import { fail, type ActionResult } from "@/lib/types/actions";
import { Constants } from "@/types/database";
import { leadFormSchema, zodFieldErrors } from "./lead-schema";

type FormState = ActionResult | null;

/** Re-resolve identity on every action; never trust the client. RLS is the final gate. */
async function requireCrmUser() {
  const user = await getCurrentUser();
  if (!user || !user.isActive || !hasRole(user.role, CAN_USE_CRM)) return null;
  return user;
}

export async function createLead(divisionSlug: string, _prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[createLead]";
  const user = await requireCrmUser();
  if (!user) return fail("You don't have access to the CRM");

  const division = parseDivision(divisionSlug);
  if (!division) return fail("Unknown division");

  const parsed = leadFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));

  const followUp = fromISTInputValue(String(formData.get("next_follow_up_at") ?? ""));
  const id = crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    id,
    division: division.db,
    ...parsed.data,
    // Sales engineers own the leads they create unless they assign someone else.
    assigned_to: parsed.data.assigned_to ?? (user.role === "sales_engineer" ? user.id : null),
    next_follow_up_at: followUp,
    created_by: user.id,
  });
  if (error) {
    console.error(op, { userId: user.id, division: division.db, error, timestamp: new Date().toISOString() });
    return fail("Couldn't save the lead. Please try again.");
  }

  redirect(`/${division.slug}/crm/${id}`);
}

export async function updateLead(
  divisionSlug: string,
  leadId: string,
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult> {
  const op = "[updateLead]";
  const user = await requireCrmUser();
  if (!user) return fail("You don't have access to the CRM");

  const parsed = leadFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").update(parsed.data).eq("id", leadId).select("id");
  if (error) {
    console.error(op, { userId: user.id, leadId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't save the changes. Please try again.");
  }
  if (!data || data.length === 0) return fail("Lead not found or you can't edit it");

  redirect(`/${divisionSlug}/crm/${leadId}`);
}

const stageSchema = z
  .object({
    stage: z.enum(Constants.public.Enums.lead_stage),
    lost_reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.stage !== "lost" || !!v.lost_reason, {
    path: ["lost_reason"],
    message: "Say why the lead was lost",
  });

export async function changeLeadStage(leadId: string, _prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[changeLeadStage]";
  const user = await requireCrmUser();
  if (!user) return fail("You don't have access to the CRM");

  const parsed = stageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      stage: parsed.data.stage,
      lost_reason: parsed.data.stage === "lost" ? (parsed.data.lost_reason ?? null) : null,
    })
    .eq("id", leadId)
    .select("id");
  if (error) {
    console.error(op, { userId: user.id, leadId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't change the stage. Please try again.");
  }
  if (!data || data.length === 0) return fail("Lead not found or you can't edit it");

  refresh();
  return { ok: true, data: null };
}

export async function scheduleLead(leadId: string, _prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[scheduleLead]";
  const user = await requireCrmUser();
  if (!user) return fail("You don't have access to the CRM");

  const followUp = fromISTInputValue(String(formData.get("next_follow_up_at") ?? ""));
  const siteVisit = fromISTInputValue(String(formData.get("site_visit_at") ?? ""));

  const supabase = await createClient();
  const { data: before, error: readError } = await supabase
    .from("leads")
    .select("next_follow_up_at, site_visit_at")
    .eq("id", leadId)
    .maybeSingle();
  if (readError) {
    console.error(op, { userId: user.id, leadId, error: readError, timestamp: new Date().toISOString() });
    return fail("Couldn't load the lead. Please try again.");
  }
  if (!before) return fail("Lead not found or you can't edit it");

  const { error } = await supabase
    .from("leads")
    .update({ next_follow_up_at: followUp, site_visit_at: siteVisit })
    .eq("id", leadId);
  if (error) {
    console.error(op, { userId: user.id, leadId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't save the schedule. Please try again.");
  }

  // Record what changed on the timeline.
  const sameInstant = (a: string | null, b: string | null) =>
    (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null);
  const entries: { lead_id: string; type: "follow_up" | "site_visit"; body: string; created_by: string }[] = [];
  if (!sameInstant(before.next_follow_up_at, followUp)) {
    entries.push({ lead_id: leadId, type: "follow_up", body: followUp ? `Follow-up set for ${formatDateTimeIST(followUp)}` : "Follow-up cleared", created_by: user.id });
  }
  if (!sameInstant(before.site_visit_at, siteVisit)) {
    entries.push({ lead_id: leadId, type: "site_visit", body: siteVisit ? `Site visit scheduled for ${formatDateTimeIST(siteVisit)}` : "Site visit cleared", created_by: user.id });
  }
  if (entries.length > 0) {
    const { error: logError } = await supabase.from("lead_activities").insert(entries);
    if (logError) console.error(op, { userId: user.id, leadId, error: logError, timestamp: new Date().toISOString() });
  }

  refresh();
  return { ok: true, data: null };
}

const activitySchema = z.object({
  type: z.enum(["note", "call", "whatsapp", "email", "site_visit"]),
  body: z.string().trim().min(1, "Write a short note").max(2000),
});

export async function addLeadActivity(leadId: string, _prev: FormState, formData: FormData): Promise<ActionResult> {
  const op = "[addLeadActivity]";
  const user = await requireCrmUser();
  if (!user) return fail("You don't have access to the CRM");

  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Check the highlighted fields", zodFieldErrors(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase
    .from("lead_activities")
    .insert({ id: crypto.randomUUID(), lead_id: leadId, ...parsed.data, created_by: user.id });
  if (error) {
    console.error(op, { userId: user.id, leadId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't add the activity. Please try again.");
  }

  refresh();
  return { ok: true, data: null };
}

export async function deleteLead(divisionSlug: string, leadId: string): Promise<ActionResult> {
  const op = "[deleteLead]";
  const user = await getCurrentUser();
  if (!user || !user.isActive || !hasRole(user.role, CAN_DELETE_LEADS)) return fail("Only admins can delete leads");

  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").delete().eq("id", leadId).select("id");
  if (error) {
    console.error(op, { userId: user.id, leadId, error, timestamp: new Date().toISOString() });
    return fail("Couldn't delete the lead. Please try again.");
  }
  if (!data || data.length === 0) return fail("Lead not found");

  redirect(`/${divisionSlug}/crm`);
}
