import Decimal from "decimal.js";

const IST = "Asia/Kolkata";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,23,456 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  return inrFormatter.format(new Decimal(amount).toNumber());
}

/** ₹1.2Cr / ₹5.0L / ₹50K */
export function shortINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const d = new Decimal(amount);
  const abs = d.abs();
  if (abs.gte(1e7)) return `₹${d.div(1e7).toFixed(1)}Cr`;
  if (abs.gte(1e5)) return `₹${d.div(1e5).toFixed(1)}L`;
  if (abs.gte(1e3)) return `₹${d.div(1e3).toFixed(0)}K`;
  return `₹${d.toFixed(0)}`;
}

export function formatKw(kw: number | null | undefined): string {
  if (kw === null || kw === undefined) return "—";
  return `${new Decimal(kw).toDecimalPlaces(2).toString()} kW`;
}

/** 11 Nov 2026, 3:30 pm (IST) */
export function formatDateTimeIST(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** 11 Nov 2026 (IST) */
export function formatDateIST(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

/** UTC ISO → value for <input type="datetime-local"> in IST ("2026-11-11T15:30"). */
export function toISTInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** <input type="datetime-local"> value, read as IST → UTC ISO string. Returns null for empty input. */
export function fromISTInputValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function leadCode(leadNumber: number): string {
  return `L-${String(leadNumber).padStart(4, "0")}`;
}

/** True when the timestamp is in the past. Server components call this per request. */
export function isPast(iso: string | null | undefined): boolean {
  return !!iso && new Date(iso).getTime() < Date.now();
}
