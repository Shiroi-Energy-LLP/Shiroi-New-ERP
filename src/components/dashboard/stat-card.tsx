import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
  tone?: "neutral" | "brand" | "danger" | "success";
}) {
  const valueTone = {
    neutral: "text-ink",
    brand: "text-brand-dark",
    danger: "text-danger",
    success: "text-success",
  }[tone];
  const body = (
    <Card className={cn("h-full p-4", href && "transition hover:border-brand")}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", valueTone)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Card for a metric whose module ships in a later phase. */
export function UpcomingCard({ label, phase, module }: { label: string; phase: number; module: string }) {
  return (
    <Card className="h-full border-dashed bg-cream/60 p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-muted/60">—</p>
      <p className="mt-1 text-xs text-muted">
        {module} · Phase {phase}
      </p>
    </Card>
  );
}
