import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseDivision, type Division } from "@/lib/divisions";
import { requireStaff } from "@/lib/auth/session";
import { listAssignableUsers } from "@/lib/crm/crm-queries";
import { createLead } from "@/lib/crm/crm-actions";
import { LeadForm } from "@/components/crm/lead-form";
import { PageHeader, Skeleton } from "@/components/ui/card";

export default async function NewLeadPage({ params }: PageProps<"/[division]/crm/new">) {
  const division = parseDivision((await params).division);
  if (!division) notFound();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Add lead" description={division.label} />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <NewLeadForm division={division} />
      </Suspense>
    </div>
  );
}

async function NewLeadForm({ division }: { division: Division }) {
  await requireStaff();
  const users = await listAssignableUsers();
  return (
    <LeadForm
      action={createLead.bind(null, division.slug)}
      users={users}
      showFollowUp
      submitLabel="Save lead"
      cancelHref={`/${division.slug}/crm`}
    />
  );
}
