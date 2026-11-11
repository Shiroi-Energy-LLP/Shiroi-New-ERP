"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MODULE_ICONS } from "@/components/ui/icons";
import { findModule } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavLinks } from "./nav-links";

const TABS = ["dashboard", "crm", "sales", "projects"] as const;

/** Phone navigation: bottom tab bar for the main modules + a drawer with everything. */
export function MobileNav({ division, divisionLabel }: { division: string; divisionLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-5">
          {TABS.map((slug) => {
            const m = findModule(slug)!;
            const href = `/${division}/${slug}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = MODULE_ICONS[m.icon];
            return (
              <Link
                key={slug}
                href={href}
                className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", active ? "text-brand-dark" : "text-muted")}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {m.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted"
          >
            <Menu className="h-5 w-5" aria-hidden />
            More
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white py-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-5">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] text-brand-dark uppercase">Shiroi Solar ERP</p>
                <p className="text-sm font-medium text-ink">{divisionLabel}</p>
              </div>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-sand/50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks division={division} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
