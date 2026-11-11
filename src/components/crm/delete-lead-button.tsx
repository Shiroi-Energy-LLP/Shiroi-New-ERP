"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/types/actions";
import { Button } from "@/components/ui/button";

export function DeleteLeadButton({ action }: { action: () => Promise<ActionResult> }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-danger"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this lead and its timeline? This can't be undone.")) return;
          startTransition(async () => {
            const result = await action();
            if (result && !result.ok) setError(result.error);
          });
        }}
      >
        {pending ? "Deleting…" : "Delete lead"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
