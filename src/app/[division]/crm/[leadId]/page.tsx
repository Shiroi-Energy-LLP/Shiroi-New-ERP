import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import { parseDivision } from "@/lib/divisions";
import { requireStaff } from "@/lib/auth/session";
import { getLead, listLeadActivities, type LeadActivity, type LeadDetail } from "@/lib/crm/crm-queries";
import { addLeadActivity, changeLeadStage, deleteLead, scheduleLead } from "@/lib/crm/crm-actions";
import { ACTIVITY_LABELS, ROOF_LABELS, SOURCE_LABELS, STAGE_META } from "@/lib/crm/crm-constants";
import { formatDateIST, formatDateTimeIST, formatINR, formatKw, leadCode } from "@/lib/format";
import { CAN_DELETE_LEADS, hasRole } from "@/lib/roles";
import { Badge, Card, Skeleton } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { ActivityPanel, SchedulePanel, StagePanel } from "@/components/crm/lead-panels";
import { DeleteLeadButton } from "@/components/crm/delete-lead-button";

export default function LeadPage({ params }: PageProps<"/[division]/crm/[leadId]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {params.then((p) => (
        <LeadView divisionSlug={p.division} leadId={p.leadId} />
      ))}
    </Suspense>
  );
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

function mapLink(lead: LeadDetail): string | null {
  if (lead.latitude !== null && lead.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`;
  }
  const q = [lead.address, lead.city, lead.pincode].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

async function LeadView({ divisionSlug, leadId }: { divisionSlug: string; leadId: string }) {
  const division = parseDivision(divisionSlug);
  if (!division || !z.uuid().safeParse(leadId).success) notFound();
  const user = await requireStaff();
  const [lead, activities] = await Promise.all([getLead(leadId), listLeadActivities(leadId)]);
  if (!lead || lead.division !== division.db) notFound();

  const map = mapLink(lead);
  const base = `/${division.slug}/crm`;

  return (
    <div className="space-y-6">
      <div>
        <Link href={base} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Leads
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">{lead.customer_name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{leadCode(lead.lead_number)}</span>
              <Badge tone={STAGE_META[lead.stage].tone}>{STAGE_META[lead.stage].label}</Badge>
              <span>since {formatDateIST(lead.stage_changed_at)}</span>
            </p>
          </div>
          <Link href={`${base}/${lead.id}/edit`} className={buttonClass("secondary", "sm")}>
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {lead.phone ? (
            <>
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className={buttonClass("primary", "sm")}>
                <Phone className="h-4 w-4" aria-hidden /> Call
              </a>
              <a href={whatsappLink(lead.phone)} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
            </>
          ) : null}
          {map ? (
            <a href={map} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
              <MapPin className="h-4 w-4" aria-hidden /> Map
            </a>
          ) : null}
        </div>
      </div>

      {/* Phone: details → stage/schedule → timeline. Desktop: actions column on the right. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
                <Info label="Phone" value={lead.phone} />
                <Info label="Email" value={lead.email} />
                <Info label="City" value={lead.city} />
                <Info label="Load requirement" value={formatKw(lead.load_requirement_kw)} />
                <Info label="Monthly EB bill" value={formatINR(lead.monthly_eb_bill)} />
                <Info label="Roof type" value={lead.roof_type ? ROOF_LABELS[lead.roof_type] : null} />
                <Info label="Source" value={SOURCE_LABELS[lead.source]} />
                <Info label="Assigned to" value={lead.assigned?.full_name ?? "Unassigned"} />
                <Info label="Created" value={`${formatDateIST(lead.created_at)}${lead.creator ? ` by ${lead.creator.full_name}` : ""}`} />
                <Info label="Address" value={[lead.address, lead.pincode].filter(Boolean).join(" – ")} className="col-span-2 sm:col-span-3" />
                {lead.notes ? <Info label="Notes" value={lead.notes} className="col-span-2 sm:col-span-3" /> : null}
                {lead.stage === "lost" && lead.lost_reason ? (
                  <Info label="Lost reason" value={lead.lost_reason} className="col-span-2 sm:col-span-3" />
                ) : null}
              </dl>
            </Card>

        </div>

        <div className="space-y-4 lg:row-span-2">
          <StagePanel action={changeLeadStage.bind(null, lead.id)} stage={lead.stage} lostReason={lead.lost_reason} />
          <SchedulePanel
            action={scheduleLead.bind(null, lead.id)}
            followUpAt={lead.next_follow_up_at}
            siteVisitAt={lead.site_visit_at}
          />
          <Card className="border-dashed bg-cream/60 p-4 text-sm text-muted">
            Proposal and &ldquo;Convert to project&rdquo; arrive with the Sales module.
          </Card>
          {hasRole(user.role, CAN_DELETE_LEADS) ? <DeleteLeadButton action={deleteLead.bind(null, division.slug, lead.id)} /> : null}
        </div>

        <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <h2 className="mb-3 text-sm font-semibold text-ink">Activity</h2>
              <ActivityPanel action={addLeadActivity.bind(null, lead.id)} />
              <Timeline activities={activities} />
            </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words whitespace-pre-line text-ink">{value || "—"}</dd>
    </div>
  );
}

function Timeline({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) return <p className="mt-4 text-sm text-muted">No activity yet.</p>;
  return (
    <ol className="mt-6 space-y-4 border-l border-sand pl-4">
      {activities.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" aria-hidden />
          <p className="text-sm text-ink">
            <span className="font-medium">{ACTIVITY_LABELS[a.type]}</span>
            {a.type === "stage_change" && a.from_stage && a.to_stage ? (
              <span className="text-muted">
                {" "}
                · {STAGE_META[a.from_stage].label} → {STAGE_META[a.to_stage].label}
              </span>
            ) : null}
          </p>
          {a.body ? <p className="mt-0.5 text-sm whitespace-pre-line text-ink/90">{a.body}</p> : null}
          <p className="mt-0.5 text-xs text-muted">
            {formatDateTimeIST(a.created_at)}
            {a.creator ? ` · ${a.creator.full_name}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-1/2" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

