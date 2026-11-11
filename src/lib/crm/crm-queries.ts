import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DivisionDb } from "@/lib/divisions";
import type { Database } from "@/types/database";
import { LEADS_PAGE_SIZE, type LeadStage } from "./crm-constants";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ActivityRow = Database["public"]["Tables"]["lead_activities"]["Row"];

export type CrmSummary = Database["public"]["Functions"]["crm_dashboard_summary"]["Returns"][number];

export type LeadListItem = Pick<
  LeadRow,
  | "id"
  | "lead_number"
  | "customer_name"
  | "phone"
  | "city"
  | "stage"
  | "source"
  | "load_requirement_kw"
  | "monthly_eb_bill"
  | "next_follow_up_at"
  | "site_visit_at"
  | "created_at"
> & { assigned: { full_name: string } | null };

export type LeadDetail = LeadRow & {
  assigned: { id: string; full_name: string } | null;
  creator: { full_name: string } | null;
};

export type LeadActivity = ActivityRow & { creator: { full_name: string } | null };

export type AssignableUser = { id: string; full_name: string; email: string };

const EMPTY_SUMMARY: CrmSummary = {
  todays_follow_ups: 0,
  overdue_follow_ups: 0,
  new_leads: 0,
  open_leads: 0,
  upcoming_site_visits: 0,
  proposals_pending: 0,
  won_this_month: 0,
};

export async function getCrmSummary(division: DivisionDb): Promise<CrmSummary> {
  const op = "[getCrmSummary]";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crm_dashboard_summary", { p_division: division });
  if (error) {
    console.error(op, { division, error, timestamp: new Date().toISOString() });
    return EMPTY_SUMMARY;
  }
  if (!data || data.length === 0) return EMPTY_SUMMARY;
  return data[0];
}

/** Strip characters that have meaning in PostgREST filter syntax. */
function cleanSearch(q: string): string {
  return q.replace(/[%,()*\\:"']/g, " ").trim().slice(0, 80);
}

export async function listLeads(params: {
  division: DivisionDb;
  stage: "open" | "all" | LeadStage;
  q: string;
  page: number;
}): Promise<{ leads: LeadListItem[]; hasMore: boolean }> {
  const op = "[listLeads]";
  const supabase = await createClient();
  const from = (params.page - 1) * LEADS_PAGE_SIZE;

  let query = supabase
    .from("leads")
    .select(
      "id, lead_number, customer_name, phone, city, stage, source, load_requirement_kw, monthly_eb_bill, next_follow_up_at, site_visit_at, created_at, assigned:profiles!leads_assigned_to_fkey(full_name)",
    )
    .eq("division", params.division);

  if (params.stage === "open") query = query.not("stage", "in", "(won,lost)");
  else if (params.stage !== "all") query = query.eq("stage", params.stage);

  const q = cleanSearch(params.q);
  if (q) query = query.or(`customer_name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`);

  if (params.stage === "open") {
    query = query.order("next_follow_up_at", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("stage_changed_at", { ascending: false });
  }

  // Fetch one extra row to know whether there is a next page (no expensive count).
  const { data, error } = await query.range(from, from + LEADS_PAGE_SIZE);
  if (error) {
    console.error(op, { ...params, error, timestamp: new Date().toISOString() });
    return { leads: [], hasMore: false };
  }
  if (!data) return { leads: [], hasMore: false };

  return { leads: data.slice(0, LEADS_PAGE_SIZE), hasMore: data.length > LEADS_PAGE_SIZE };
}

export async function getLead(id: string): Promise<LeadDetail | null> {
  const op = "[getLead]";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "*, assigned:profiles!leads_assigned_to_fkey(id, full_name), creator:profiles!leads_created_by_fkey(full_name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(op, { id, error, timestamp: new Date().toISOString() });
    return null;
  }
  return data;
}

export async function listLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const op = "[listLeadActivities]";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*, creator:profiles!lead_activities_created_by_fkey(full_name)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .range(0, 199);
  if (error) {
    console.error(op, { leadId, error, timestamp: new Date().toISOString() });
    return [];
  }
  return data ?? [];
}

export type FollowUpItem = Pick<LeadRow, "id" | "lead_number" | "customer_name" | "city" | "stage" | "next_follow_up_at" | "phone">;

/** Open leads whose follow-up is due today or overdue (IST), soonest first. */
export async function listDueFollowUps(division: DivisionDb, limit = 6): Promise<FollowUpItem[]> {
  const op = "[listDueFollowUps]";
  const supabase = await createClient();
  const endOfTodayIST = new Date(
    `${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())}T23:59:59.999+05:30`,
  ).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("id, lead_number, customer_name, city, stage, next_follow_up_at, phone")
    .eq("division", division)
    .not("stage", "in", "(won,lost)")
    .lte("next_follow_up_at", endOfTodayIST)
    .order("next_follow_up_at", { ascending: true })
    .range(0, limit - 1);
  if (error) {
    console.error(op, { division, error, timestamp: new Date().toISOString() });
    return [];
  }
  return data ?? [];
}

/** People a lead can be assigned to: active sales staff and management. */
export async function listAssignableUsers(): Promise<AssignableUser[]> {
  const op = "[listAssignableUsers]";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .in("role", ["super_admin", "director", "sales_manager", "sales_engineer"])
    .order("full_name")
    .range(0, 499);
  if (error) {
    console.error(op, { error, timestamp: new Date().toISOString() });
    return [];
  }
  return data ?? [];
}
