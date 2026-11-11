"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/types/actions";
import type { StaffUser } from "@/lib/users/users-queries";
import { ROLE_OPTIONS } from "@/lib/roles";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function UserRow({ user, action, isSelf }: { user: StaffUser; action: Action; isSelf: boolean }) {
  const { state, pending, onSubmit, formError } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <Field label={user.email} htmlFor={`name-${user.id}`}>
        <Input id={`name-${user.id}`} name="full_name" defaultValue={user.full_name} />
      </Field>
      <Field label="Role" htmlFor={`role-${user.id}`}>
        <Select id={`role-${user.id}`} name="role" defaultValue={user.role ?? ""} disabled={isSelf}>
          <option value="">No role</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
        {isSelf ? <input type="hidden" name="role" value={user.role ?? ""} /> : null}
      </Field>
      <label className="flex h-10 items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="is_active" defaultChecked={user.is_active} disabled={isSelf} className="h-4 w-4 accent-brand" />
        Active
        {isSelf ? <input type="hidden" name="is_active" value="on" /> : null}
      </label>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state?.ok && !pending ? <span className="text-xs text-success">Saved</span> : null}
      </div>
      {formError ? <p className="text-xs text-danger sm:col-span-4">{formError}</p> : null}
    </form>
  );
}

export function AddUserForm({ action }: { action: Action }) {
  const { state, pending, onSubmit, fieldErrors: e, formError } = useFormAction(action);
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }
  return (
    <form key={formKey} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Full name" htmlFor="new-full_name" error={e.full_name}>
        <Input id="new-full_name" name="full_name" />
      </Field>
      <Field label="Work email" htmlFor="new-email" error={e.email}>
        <Input id="new-email" name="email" type="email" />
      </Field>
      <Field label="Role" htmlFor="new-role" error={e.role}>
        <Select id="new-role" name="role" defaultValue="">
          <option value="" disabled>
            Pick a role
          </option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Temporary password" htmlFor="new-password" error={e.password} hint="At least 10 characters. Share it privately.">
        <Input id="new-password" name="password" type="text" autoComplete="off" />
      </Field>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add user"}
        </Button>
        {state?.ok && !pending ? <span className="text-xs text-success">User added and activated</span> : null}
        {formError && Object.keys(e).length === 0 ? <span className="text-xs text-danger">{formError}</span> : null}
      </div>
    </form>
  );
}
