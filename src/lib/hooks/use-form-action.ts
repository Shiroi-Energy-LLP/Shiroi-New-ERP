"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionResult } from "@/lib/types/actions";

/**
 * Wraps a server action for a form without React's automatic form reset,
 * so typed values survive a validation error.
 */
export function useFormAction(action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>) {
  const [state, dispatch, pending] = useActionState(action, null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const formError = state && !state.ok ? state.error : null;
  return { state, pending, onSubmit, fieldErrors, formError };
}
