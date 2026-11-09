import { Suspense } from "react";
import { connection } from "next/server";
import { getSupabaseHealth } from "@/lib/system/health-queries";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark">Shiroi Energy</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">ERP2</h1>
        <p className="mt-2 text-sm text-muted">Foundation build. Modules will appear here as they are built.</p>

        <div className="mt-8 rounded-lg border border-sand bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">System status</h2>
          <Suspense fallback={<StatusRow label="Database" state="checking" detail="Checking…" />}>
            <DatabaseStatus />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function DatabaseStatus() {
  await connection(); // check on every request, never prerendered
  const health = await getSupabaseHealth();
  return health.ok ? (
    <StatusRow label="Database" state="ok" detail={`Connected · ${health.latencyMs} ms`} />
  ) : (
    <StatusRow label="Database" state="error" detail={health.error} />
  );
}

function StatusRow({
  label,
  state,
  detail,
}: {
  label: string;
  state: "ok" | "error" | "checking";
  detail: string;
}) {
  const dot = { ok: "bg-success", error: "bg-danger", checking: "bg-sand" }[state];
  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-ink">{label}</span>
      <span className="flex items-center gap-2 text-muted">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        {detail}
      </span>
    </div>
  );
}
