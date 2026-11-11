import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { DIVISION_LIST, parseDivision } from "@/lib/divisions";

export function generateStaticParams() {
  return DIVISION_LIST.map((d) => ({ division: d.slug }));
}

export default async function DivisionLayout({ children, params }: LayoutProps<"/[division]">) {
  const division = parseDivision((await params).division);
  if (!division) notFound();
  return <AppShell division={division}>{children}</AppShell>;
}
