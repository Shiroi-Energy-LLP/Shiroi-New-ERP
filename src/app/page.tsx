import Link from "next/link";
import { Factory, Home } from "lucide-react";
import { DIVISION_LIST } from "@/lib/divisions";
import { signOut } from "@/lib/auth/auth-actions";

const ICONS = { rooftop: Home, "ground-mount": Factory } as const;

/** Landing screen: pick the business division. */
export default function SelectDivision() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-brand-dark uppercase">Shiroi</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Solar ERP</h1>
          <p className="mt-6 text-sm font-medium text-muted">Select business division</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DIVISION_LIST.map((d) => {
            const Icon = ICONS[d.slug];
            return (
              <Link
                key={d.slug}
                href={`/${d.slug}/dashboard`}
                className="group rounded-xl border border-sand bg-white p-5 transition hover:border-brand hover:shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand-dark">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-semibold text-ink group-hover:text-brand-dark">{d.label}</p>
                <p className="mt-1 text-sm text-muted">{d.description}</p>
              </Link>
            );
          })}
        </div>
        <form action={signOut} className="mt-8 text-center">
          <button type="submit" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
