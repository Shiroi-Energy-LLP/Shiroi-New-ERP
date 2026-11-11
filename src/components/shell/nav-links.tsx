"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_MODULES } from "@/lib/nav";
import { MODULE_ICONS } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Sidebar / drawer navigation. Highlights the current module. */
export function NavLinks({ division, onNavigate }: { division: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavList division={division} pathname={pathname} onNavigate={onNavigate} />;
}

/** Same list without the active state, used as the static fallback. */
export function NavList({
  division,
  pathname,
  onNavigate,
}: {
  division: string;
  pathname?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-0.5 px-2">
      {NAV_MODULES.map((m) => {
        const href = `/${division}/${m.slug}`;
        const active = pathname ? pathname === href || pathname.startsWith(`${href}/`) : false;
        const Icon = MODULE_ICONS[m.icon];
        return (
          <Link
            key={m.slug}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-brand/15 font-medium text-brand-dark" : "text-ink hover:bg-sand/50",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{m.label}</span>
            {!m.built ? <span className="text-[10px] text-muted">P{m.phase}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
