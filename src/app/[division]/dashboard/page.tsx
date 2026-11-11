import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2, FolderPlus, IndianRupee, Plus, Receipt, ShoppingCart } from "lucide-react";
import { parseDivision, type Division } from "@/lib/divisions";
import { requireStaff } from "@/lib/auth/session";
import { getCrmSummary, listDueFollowUps } from "@/lib/crm/crm-queries";
import { STAGE_META } from "@/lib/crm/crm-constants";
import { formatDateTimeIST, isPast, leadCode } from "@/lib/format";
import { Badge, Card, PageHeader, Skeleton } from "@/components/ui/card";
import { StatCard, UpcomingCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";

export default async function DashboardPage({ params }: PageProps<"/[division]/dashboard">) {
  const division = parseDivision((await params).division);
  if (!division) notFound();

  return (
    <>
      <PageHeader title="Dashboard" description={division.label} />
      <QuickActions division={division} />

      <h2 className="mt-8 mb-3 text-sm font-semibold text-ink">Sales pipeline</h2>
      <Suspense fallback={<CardsSkeleton count={7} />}>
        <CrmCards division={division} />
      </Suspense>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-ink">Follow-ups due</h2>
          <Suspense fallback={<Skeleton className="h-48" />}>
            <DueFollowUps division={division} />
          </Suspense>
        </div>
        <div className="xl:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink">Operations</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <UpcomingCard label="Projects in progress" module="Projects" phase={1} />
            <UpcomingCard label="Projects completed" module="Projects" phase={1} />
            <UpcomingCard label="Upcoming installations" module="Projects" phase={1} />
            <UpcomingCard label="Revenue this month" module="Finance" phase={1} />
            <UpcomingCard label="Profit this month" module="Finance" phase={1} />
            <UpcomingCard label="Outstanding payments" module="Finance" phase={1} />
            <UpcomingCard label="Today's expenses" module="Finance" phase={1} />
            <UpcomingCard label="Purchase orders pending" module="Procurement" phase={2} />
            <UpcomingCard label="Material shortage" module="Inventory" phase={2} />
            <UpcomingCard label="Employee attendance" module="HR" phase={3} />
          </div>
        </div>
      </div>
    </>
  );
}

function QuickActions({ division }: { division: Division }) {
  const actions = [
    { label: "Add Lead", href: `/${division.slug}/crm/new`, icon: Plus, ready: true },
    { label: "Create Proposal", href: `/${division.slug}/sales`, icon: FilePlus2, ready: false },
    { label: "New Project", href: `/${division.slug}/projects`, icon: FolderPlus, ready: false },
    { label: "Generate Invoice", href: `/${division.slug}/finance`, icon: Receipt, ready: false },
    { label: "Create PO", href: `/${division.slug}/procurement`, icon: ShoppingCart, ready: false },
    { label: "Record Expense", href: `/${division.slug}/finance`, icon: IndianRupee, ready: false },
  ];
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
      {actions.map(({ label, href, icon: Icon, ready }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
            ready
              ? "border-brand bg-brand text-brand-night hover:bg-brand-hover"
              : "border-sand bg-white text-muted hover:text-ink",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}

async function CrmCards({ division }: { division: Division }) {
  await requireStaff();
  const s = await getCrmSummary(division.db);
  const crm = `/${division.slug}/crm`;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      <StatCard label="Today's follow-ups" value={s.todays_follow_ups} href={crm} tone="brand" />
      <StatCard
        label="Overdue follow-ups"
        value={s.overdue_follow_ups}
        href={crm}
        tone={s.overdue_follow_ups > 0 ? "danger" : "neutral"}
      />
      <StatCard label="New leads" value={s.new_leads} href={`${crm}?stage=new`} />
      <StatCard label="Open leads" value={s.open_leads} href={crm} />
      <StatCard label="Upcoming site visits" value={s.upcoming_site_visits} href={`${crm}?stage=site_visit`} />
      <StatCard label="Quotations pending" value={s.proposals_pending} href={`${crm}?stage=proposal_sent`} />
      <StatCard label="Won this month" value={s.won_this_month} href={`${crm}?stage=won`} tone="success" />
    </div>
  );
}

async function DueFollowUps({ division }: { division: Division }) {
  await requireStaff();
  const items = await listDueFollowUps(division.db);
  if (items.length === 0) {
    return <Card className="p-6 text-center text-sm text-muted">No follow-ups due. 🎉</Card>;
  }
  return (
    <Card className="divide-y divide-sand">
      {items.map((l) => {
        const overdue = isPast(l.next_follow_up_at);
        return (
          <Link key={l.id} href={`/${division.slug}/crm/${l.id}`} className="flex items-center gap-3 p-3 hover:bg-cream">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{l.customer_name}</p>
              <p className={cn("text-xs", overdue ? "text-danger" : "text-muted")}>
                {leadCode(l.lead_number)} · {formatDateTimeIST(l.next_follow_up_at)}
              </p>
            </div>
            <Badge tone={STAGE_META[l.stage].tone}>{STAGE_META[l.stage].label}</Badge>
          </Link>
        );
      })}
    </Card>
  );
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
