import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/auth-actions";
import { ROLE_LABELS } from "@/lib/roles";

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isActive || !user.role) redirect("/pending");

  const name = user.fullName || user.email;
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="text-sm leading-tight font-medium text-ink">{name}</p>
        <p className="text-xs leading-tight text-muted">{ROLE_LABELS[user.role]}</p>
      </div>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-night">
        {name.charAt(0).toUpperCase()}
      </span>
      <form action={signOut}>
        <button type="submit" title="Sign out" className="rounded-md p-2 text-muted hover:bg-sand/50 hover:text-ink">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="sr-only">Sign out</span>
        </button>
      </form>
    </div>
  );
}
