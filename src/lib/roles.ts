import type { Database } from "@/types/database";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  director: "Director",
  sales_manager: "Sales Manager",
  sales_engineer: "Sales Engineer",
  project_manager: "Project Manager",
  project_engineer: "Project Engineer",
  purchase: "Purchase",
  accounts: "Accounts",
  hr: "HR",
  store_manager: "Store Manager",
  technician: "Technician",
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as AppRole, label }));

/** Mirrors the RLS policies, for showing/hiding UI only. The database is the real gate. */
export const CAN_MANAGE_USERS: AppRole[] = ["super_admin", "director"];
export const CAN_USE_CRM: AppRole[] = ["super_admin", "director", "sales_manager", "sales_engineer"];
export const CAN_DELETE_LEADS: AppRole[] = ["super_admin", "director"];

export function hasRole(role: AppRole | null | undefined, allowed: AppRole[]): boolean {
  return !!role && allowed.includes(role);
}
