"use client";

import { useState } from "react";
import { changePassword } from "@/lib/auth/auth-actions";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function PasswordForm() {
  const { state, pending, onSubmit, fieldErrors: e, formError } = useFormAction(changePassword);
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }
  return (
    <form key={formKey} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Field label="New password" htmlFor="password" error={e.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </Field>
      <Field label="Confirm" htmlFor="confirm" error={e.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" />
      </Field>
      <Button type="submit" size="sm" variant="secondary" disabled={pending} className="h-10">
        {pending ? "Saving…" : "Change password"}
      </Button>
      {state?.ok && !pending ? <p className="text-xs text-success sm:col-span-3">Password changed</p> : null}
      {formError && Object.keys(e).length === 0 ? <p className="text-xs text-danger sm:col-span-3">{formError}</p> : null}
    </form>
  );
}
