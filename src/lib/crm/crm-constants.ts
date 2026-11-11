// Client-safe CRM constants (no server imports). Labels, order and colours for enums.
import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];
export type LeadStage = Enums["lead_stage"];
export type LeadSource = Enums["lead_source"];
export type RoofType = Enums["roof_type"];
export type LeadActivityType = Enums["lead_activity_type"];
export type BadgeTone = "neutral" | "brand" | "success" | "danger" | "info" | "muted";

export const STAGE_ORDER: LeadStage[] = ["new", "contacted", "site_visit", "proposal_sent", "negotiation", "won", "lost"];

export const STAGE_META: Record<LeadStage, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "neutral" },
  site_visit: { label: "Site Visit", tone: "brand" },
  proposal_sent: { label: "Proposal Sent", tone: "brand" },
  negotiation: { label: "Negotiation", tone: "brand" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "muted" },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  manual: "Manual",
  whatsapp: "WhatsApp",
  referral: "Referral",
  indiamart: "IndiaMart",
  facebook: "Facebook",
  google: "Google",
};

export const ROOF_LABELS: Record<RoofType, string> = {
  rcc: "RCC (concrete)",
  metal_sheet: "Metal sheet",
  tile: "Tile",
  asbestos: "Asbestos",
  open_land: "Open land",
  other: "Other",
};

export const ACTIVITY_LABELS: Record<LeadActivityType, string> = {
  created: "Lead created",
  note: "Note",
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  site_visit: "Site visit",
  follow_up: "Follow-up scheduled",
  stage_change: "Stage changed",
};

/** Activity types a user can log by hand. */
export const LOGGABLE_ACTIVITIES: LeadActivityType[] = ["note", "call", "whatsapp", "email", "site_visit"];

/** List filters: "open" = everything not won/lost. */
export const STAGE_FILTERS: Array<{ value: "open" | "all" | LeadStage; label: string }> = [
  { value: "open", label: "Open" },
  ...STAGE_ORDER.map((s) => ({ value: s, label: STAGE_META[s].label })),
  { value: "all", label: "All" },
];

export const LEADS_PAGE_SIZE = 25;
