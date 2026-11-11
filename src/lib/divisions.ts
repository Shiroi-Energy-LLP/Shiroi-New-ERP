import type { Database } from "@/types/database";

export type DivisionDb = Database["public"]["Enums"]["business_division"];
export type DivisionSlug = "rooftop" | "ground-mount";

export type Division = {
  slug: DivisionSlug;
  db: DivisionDb;
  label: string;
  short: string;
  description: string;
};

export const DIVISIONS: Record<DivisionSlug, Division> = {
  rooftop: {
    slug: "rooftop",
    db: "rooftop",
    label: "Rooftop Solar Projects",
    short: "Rooftop",
    description: "Residential, commercial and industrial rooftop systems",
  },
  "ground-mount": {
    slug: "ground-mount",
    db: "ground_mount",
    label: "Ground Mount Solar Projects",
    short: "Ground Mount",
    description: "Utility and open-access ground-mounted plants",
  },
};

export const DIVISION_LIST = Object.values(DIVISIONS);

export function parseDivision(slug: string): Division | null {
  return slug in DIVISIONS ? DIVISIONS[slug as DivisionSlug] : null;
}
