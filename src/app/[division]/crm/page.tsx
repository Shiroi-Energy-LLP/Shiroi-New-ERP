import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import { Plus, Search } from "lucide-react";
import { parseDivision, type Division } from "@/lib/divisions";
import { requireStaff } from "@/lib/auth/session";
import { listLeads } from "@/lib/crm/crm-queries";
import { SOURCE_LABELS, STAGE_FILTERS, STAGE_META, STAGE_ORDER, type LeadStage } from "@/lib/crm/crm-constants";
import { formatDateTimeIST, formatKw, isPast, leadCode, shortINR } from "@/lib/format";
import { Badge, Card, PageHeader, Skeleton } from "@/components/ui/card";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filter = "open" | "all" | LeadStage;

function parseFilter(v: unknown): Filter {
  const s = typeof v === "string" ? v : "";
  return s === "all" || (STAGE_ORDER as string[]).includes(s) ? (s as Filter) : "open";
}

export default async function CrmPage({ params, searchParams }: PageProps<"/[division]/crm">) {
  const division = parseDivision((await params).division);
  if (!division) notFound();

  return (
    <>
      <PageHeader
        title="CRM"
        description="Leads, follow-ups and site visits"
        actions={
          <ButtonLink href={`/${division.slug}/crm/new`}>
            <Plus className="h-4 w-4" aria-hidden /> Add lead
          </ButtonLink>
        }
      />
      <Suspense fallback={<ListSkeleton />}>
        {searchParams.then((sp) => (
          <LeadList
            division={division}
            filter={parseFilter(sp.stage)}
            q={typeof sp.q === "string" ? sp.q : ""}
            page={Math.max(1, Number(sp.page) || 1)}
          />
        ))}
      </Suspense>
    </>
  );
}

async function LeadList({ division, filter, q, page }: { division: Division; filter: Filter; q: string; page: number }) {
  await requireStaff();
  await io(); // reads the current time (overdue follow-ups): render per request
  const { leads, hasMore } = await listLeads({ division: division.db, stage: filter, q, page });
  const base = `/${division.slug}/crm`;
  const href = (next: { stage?: Filter; page?: number }) => {
    const sp = new URLSearchParams();
    const stage = next.stage ?? filter;
    if (stage !== "open") sp.set("stage", stage);
    if (q) sp.set("q", q);
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    const s = sp.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="space-y-4">
      <form action={base} method="get" className="flex gap-2">
        {filter !== "open" ? <input type="hidden" name="stage" value={filter} /> : null}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone or city"
            className="h-10 w-full rounded-md border border-sand bg-white pr-3 pl-9 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
          />
        </div>
        <button type="submit" className={buttonClass("secondary")}>
          Search
        </button>
      </form>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {STAGE_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={href({ stage: f.value, page: 1 })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm",
              f.value === filter ? "border-brand bg-brand text-brand-night" : "border-sand bg-white text-muted hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-medium text-ink">No leads here</p>
          <p className="mt-1 text-sm text-muted">{q ? "Try a different search." : "Add your first lead to get started."}</p>
        </Card>
      ) : (
        <Card className="divide-y divide-sand overflow-hidden">
          {leads.map((l) => {
            const overdue = !["won", "lost"].includes(l.stage) && isPast(l.next_follow_up_at);
            return (
              <Link key={l.id} href={`${base}/${l.id}`} className="block p-4 hover:bg-cream">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{l.customer_name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {leadCode(l.lead_number)}
                      {l.city ? ` · ${l.city}` : ""} · {SOURCE_LABELS[l.source]}
                    </p>
                  </div>
                  <Badge tone={STAGE_META[l.stage].tone}>{STAGE_META[l.stage].label}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span>{formatKw(l.load_requirement_kw)}</span>
                  <span>EB {shortINR(l.monthly_eb_bill)}/mo</span>
                  {l.assigned ? <span>👤 {l.assigned.full_name}</span> : <span>Unassigned</span>}
                  {l.next_follow_up_at && !["won", "lost"].includes(l.stage) ? (
                    <span className={cn(overdue && "font-medium text-danger")}>
                      Follow-up {formatDateTimeIST(l.next_follow_up_at)}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </Card>
      )}

      {page > 1 || hasMore ? (
        <div className="flex justify-between">
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className={buttonClass("secondary", "sm")}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {hasMore ? (
            <Link href={href({ page: page + 1 })} className={buttonClass("secondary", "sm")}>
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-64" />
    </div>
  );
}
