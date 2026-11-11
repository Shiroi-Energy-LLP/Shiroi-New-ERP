import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";
import type { Division } from "@/lib/divisions";
import { Skeleton } from "@/components/ui/card";
import { NavLinks, NavList } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export function AppShell({ division, children }: { division: Division; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sand bg-white py-4 lg:flex">
        <Link href="/" className="mb-6 block px-5">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-brand-dark uppercase">Shiroi</p>
          <p className="text-base font-bold text-ink">Solar ERP</p>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<NavList division={division.slug} />}>
            <NavLinks division={division.slug} />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-sand bg-white/95 px-4 backdrop-blur lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md border border-sand px-2.5 py-1 text-sm font-medium text-ink hover:bg-cream"
            title="Switch division"
          >
            {division.short}
            <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden />
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              disabled
              title="Notifications arrive in Phase 5"
              className="rounded-md p-2 text-muted disabled:opacity-60"
            >
              <Bell className="h-4 w-4" aria-hidden />
              <span className="sr-only">Notifications</span>
            </button>
            <Suspense fallback={<Skeleton className="h-8 w-28" />}>
              <UserMenu />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 px-4 pt-6 pb-24 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <Suspense>
        <MobileNav division={division.slug} divisionLabel={division.label} />
      </Suspense>
    </div>
  );
}
