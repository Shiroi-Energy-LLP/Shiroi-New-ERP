import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { NAV_MODULES, findModule } from "@/lib/nav";
import { Card, PageHeader } from "@/components/ui/card";

export function generateStaticParams() {
  return NAV_MODULES.filter((m) => !m.built).map((m) => ({ module: m.slug }));
}

/** Placeholder for modules scheduled in later roadmap phases. */
export default async function ComingSoon({ params }: PageProps<"/[division]/[module]">) {
  const m = findModule((await params).module);
  if (!m || m.built) notFound();

  return (
    <>
      <PageHeader title={m.label} description={m.summary} />
      <Card className="flex flex-col items-center p-10 text-center">
        <Construction className="h-8 w-8 text-brand" aria-hidden />
        <p className="mt-3 font-medium text-ink">Coming in Phase {m.phase}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          This module is on the roadmap. The menu shows it now so the layout stays the same as modules are added.
        </p>
      </Card>
    </>
  );
}
