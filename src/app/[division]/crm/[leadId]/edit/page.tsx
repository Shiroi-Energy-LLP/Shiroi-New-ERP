import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { parseDivision } from "@/lib/divisions";
import { requireStaff } from "@/lib/auth/session";
import { getLead, listAssignableUsers } from "@/lib/crm/crm-queries";
import { updateLead } from "@/lib/crm/crm-actions";
import { leadCode } from "@/lib/format";
import { LeadForm } from "@/components/crm/lead-form";
import { PageHeader, Skeleton } from "@/components/ui/card";

export default function EditLeadPage({ params }: PageProps<"/[division]/crm/[leadId]/edit">) {
  return (
    <div className="max-w-3xl">
      <Suspense fallback={<Skeleton className="h-96" />}>
        {params.then((p) => (
          <EditLead divisionSlug={p.division} leadId={p.leadId} />
        ))}
      </Suspense>
    </div>
  );
}

async function EditLead({ divisionSlug, leadId }: { divisionSlug: string; leadId: string }) {
  const division = parseDivision(divisionSlug);
  if (!division || !z.uuid().safeParse(leadId).success) notFound();
  await requireStaff();
  const [lead, users] = await Promise.all([getLead(leadId), listAssignableUsers()]);
  if (!lead || lead.division !== division.db) notFound();

  return (
    <>
      <PageHeader title={`Edit ${lead.customer_name}`} description={leadCode(lead.lead_number)} />
      <LeadForm
        action={updateLead.bind(null, division.slug, lead.id)}
        users={users}
        lead={lead}
        submitLabel="Save changes"
        cancelHref={`/${division.slug}/crm/${lead.id}`}
      />
    </>
  );
}
