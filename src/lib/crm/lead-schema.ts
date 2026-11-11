// Validation for lead forms (shared, no server imports).
import Decimal from "decimal.js";
import { z } from "zod";
import { Constants } from "@/types/database";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const optionalAmount = (label: string, scale: number) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      try {
        const d = new Decimal(v.replace(/,/g, ""));
        if (d.isNegative()) {
          ctx.addIssue({ code: "custom", message: `${label} can't be negative` });
          return z.NEVER;
        }
        return d.toDecimalPlaces(scale).toNumber();
      } catch {
        ctx.addIssue({ code: "custom", message: `${label} must be a number` });
        return z.NEVER;
      }
    });

export const leadFormSchema = z.object({
  customer_name: z.string().trim().min(1, "Customer name is required").max(200),
  phone: optionalText(20).refine((v) => !v || /^[+\d][\d\s-]{6,19}$/.test(v), "Enter a valid phone number"),
  email: optionalText(200).refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email"),
  address: optionalText(500),
  city: optionalText(100),
  pincode: optionalText(10).refine((v) => !v || /^\d{6}$/.test(v), "Pincode is 6 digits"),
  source: z.enum(Constants.public.Enums.lead_source),
  roof_type: z
    .union([z.enum(Constants.public.Enums.roof_type), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  load_requirement_kw: optionalAmount("Load requirement", 2),
  monthly_eb_bill: optionalAmount("Monthly EB bill", 2),
  assigned_to: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => !v || z.uuid().safeParse(v).success, "Pick a valid person"),
  notes: optionalText(2000),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
