"use client";

import Link from "next/link";
import type { ActionResult } from "@/lib/types/actions";
import type { AssignableUser, LeadDetail } from "@/lib/crm/crm-queries";
import { ROOF_LABELS, SOURCE_LABELS } from "@/lib/crm/crm-constants";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { Button, buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Props = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  users: AssignableUser[];
  lead?: LeadDetail;
  showFollowUp?: boolean;
  submitLabel: string;
  cancelHref: string;
};

export function LeadForm({ action, users, lead, showFollowUp, submitLabel, cancelHref }: Props) {
  const { pending, onSubmit, fieldErrors: e, formError } = useFormAction(action);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="space-y-4 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Customer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name *" htmlFor="customer_name" error={e.customer_name} className="sm:col-span-2">
            <Input id="customer_name" name="customer_name" defaultValue={lead?.customer_name} required autoFocus={!lead} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={e.phone}>
            <Input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={lead?.phone ?? ""} placeholder="98400 12345" />
          </Field>
          <Field label="Email" htmlFor="email" error={e.email}>
            <Input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} />
          </Field>
          <Field label="Address" htmlFor="address" error={e.address} className="sm:col-span-2">
            <Textarea id="address" name="address" rows={2} defaultValue={lead?.address ?? ""} />
          </Field>
          <Field label="City" htmlFor="city" error={e.city}>
            <Input id="city" name="city" defaultValue={lead?.city ?? ""} placeholder="Chennai" />
          </Field>
          <Field label="Pincode" htmlFor="pincode" error={e.pincode}>
            <Input id="pincode" name="pincode" inputMode="numeric" maxLength={6} defaultValue={lead?.pincode ?? ""} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Requirement</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Load requirement (kW)" htmlFor="load_requirement_kw" error={e.load_requirement_kw}>
            <Input
              id="load_requirement_kw"
              name="load_requirement_kw"
              inputMode="decimal"
              defaultValue={lead?.load_requirement_kw ?? ""}
              placeholder="5"
            />
          </Field>
          <Field label="Monthly EB bill (₹)" htmlFor="monthly_eb_bill" error={e.monthly_eb_bill}>
            <Input
              id="monthly_eb_bill"
              name="monthly_eb_bill"
              inputMode="decimal"
              defaultValue={lead?.monthly_eb_bill ?? ""}
              placeholder="4500"
            />
          </Field>
          <Field label="Roof type" htmlFor="roof_type" error={e.roof_type}>
            <Select id="roof_type" name="roof_type" defaultValue={lead?.roof_type ?? ""}>
              <option value="">Not known yet</option>
              {Object.entries(ROOF_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lead source" htmlFor="source" error={e.source}>
            <Select id="source" name="source" defaultValue={lead?.source ?? "manual"}>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Ownership</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assigned sales engineer" htmlFor="assigned_to" error={e.assigned_to}>
            <Select id="assigned_to" name="assigned_to" defaultValue={lead?.assigned_to ?? ""}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </Select>
          </Field>
          {showFollowUp ? (
            <Field label="First follow-up (IST)" htmlFor="next_follow_up_at">
              <Input id="next_follow_up_at" name="next_follow_up_at" type="datetime-local" />
            </Field>
          ) : null}
          <Field label="Notes" htmlFor="notes" error={e.notes} className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={3} defaultValue={lead?.notes ?? ""} />
          </Field>
        </div>
      </Card>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClass("secondary")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
