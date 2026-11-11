"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/types/actions";
import { ACTIVITY_LABELS, LOGGABLE_ACTIVITIES, STAGE_META, STAGE_ORDER, type LeadStage } from "@/lib/crm/crm-constants";
import { toISTInputValue } from "@/lib/format";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function Saved({ show }: { show: boolean }) {
  return show ? <span className="text-xs text-success">Saved</span> : null;
}

export function StagePanel({ action, stage, lostReason }: { action: Action; stage: LeadStage; lostReason: string | null }) {
  const [selected, setSelected] = useState<LeadStage>(stage);
  const { state, pending, onSubmit, fieldErrors, formError } = useFormAction(action);
  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Stage</h2>
        <Select name="stage" aria-label="Stage" value={selected} onChange={(e) => setSelected(e.target.value as LeadStage)}>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </Select>
        {selected === "lost" ? (
          <Field label="Why was it lost? *" htmlFor="lost_reason" error={fieldErrors.lost_reason}>
            <Textarea id="lost_reason" name="lost_reason" rows={2} defaultValue={lostReason ?? ""} />
          </Field>
        ) : null}
        {formError && !fieldErrors.lost_reason ? <p className="text-xs text-danger">{formError}</p> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={pending || (selected === stage && selected !== "lost")}>
            {pending ? "Saving…" : "Update stage"}
          </Button>
          <Saved show={!!state?.ok && !pending} />
        </div>
      </form>
    </Card>
  );
}

export function SchedulePanel({
  action,
  followUpAt,
  siteVisitAt,
}: {
  action: Action;
  followUpAt: string | null;
  siteVisitAt: string | null;
}) {
  const { state, pending, onSubmit, formError } = useFormAction(action);
  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Schedule (IST)</h2>
        <Field label="Next follow-up" htmlFor="next_follow_up_at">
          <Input id="next_follow_up_at" name="next_follow_up_at" type="datetime-local" defaultValue={toISTInputValue(followUpAt)} />
        </Field>
        <Field label="Site visit" htmlFor="site_visit_at">
          <Input id="site_visit_at" name="site_visit_at" type="datetime-local" defaultValue={toISTInputValue(siteVisitAt)} />
        </Field>
        {formError ? <p className="text-xs text-danger">{formError}</p> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "Saving…" : "Save schedule"}
          </Button>
          <Saved show={!!state?.ok && !pending} />
        </div>
      </form>
    </Card>
  );
}

export function ActivityPanel({ action }: { action: Action }) {
  const { pending, onSubmit, fieldErrors, formError, state } = useFormAction(action);
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  // Clear the note after a successful save.
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }
  return (
    <form key={formKey} onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Select name="type" aria-label="Activity type" defaultValue="call" className="w-36 shrink-0">
          {LOGGABLE_ACTIVITIES.map((t) => (
            <option key={t} value={t}>
              {ACTIVITY_LABELS[t]}
            </option>
          ))}
        </Select>
        <Input name="body" placeholder="What happened?" aria-label="Note" />
      </div>
      {fieldErrors.body || formError ? <p className="text-xs text-danger">{fieldErrors.body ?? formError}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add to timeline"}
      </Button>
    </form>
  );
}
