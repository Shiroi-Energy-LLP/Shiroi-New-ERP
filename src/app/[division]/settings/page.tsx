import { Suspense } from "react";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/session";
import { listUsers } from "@/lib/users/users-queries";
import { createUser, updateUser } from "@/lib/users/users-actions";
import { getSupabaseHealth } from "@/lib/system/health-queries";
import { CAN_MANAGE_USERS, ROLE_LABELS, hasRole } from "@/lib/roles";
import { Badge, Card, PageHeader, Skeleton } from "@/components/ui/card";
import { AddUserForm, UserRow } from "@/components/settings/user-forms";
import { PasswordForm } from "@/components/settings/password-form";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Users, roles and system status" />
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Your account</h2>
          <Card className="p-4">
            <PasswordForm />
          </Card>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Users &amp; roles</h2>
          <Suspense fallback={<Skeleton className="h-64" />}>
            <UsersSection />
          </Suspense>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">System status</h2>
          <Suspense fallback={<Skeleton className="h-16" />}>
            <SystemStatus />
          </Suspense>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Coming later</h2>
          <Card className="border-dashed bg-cream/60 p-4 text-sm text-muted">
            Masters, company details, GST, banks, approval workflows, email / WhatsApp / SMS, backup and audit log.
          </Card>
        </section>
      </div>
    </>
  );
}

async function UsersSection() {
  const me = await requireStaff();
  if (!hasRole(me.role, CAN_MANAGE_USERS)) {
    return (
      <Card className="p-4 text-sm text-muted">
        You&apos;re signed in as <span className="font-medium text-ink">{ROLE_LABELS[me.role]}</span>. Only a Super Admin or
        Director can manage users.
      </Card>
    );
  }
  const users = await listUsers();
  return (
    <div className="space-y-4">
      <Card className="divide-y divide-sand">
        {users.map((u) => (
          <div key={u.id}>
            <div className="flex items-center gap-2 px-4 pt-3">
              {u.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="muted">Inactive</Badge>}
              {u.id === me.id ? <Badge tone="brand">You</Badge> : null}
            </div>
            <UserRow user={u} action={updateUser.bind(null, u.id)} isSelf={u.id === me.id} />
          </div>
        ))}
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Add a user</h3>
        <AddUserForm action={createUser} />
      </Card>
    </div>
  );
}

async function SystemStatus() {
  await connection();
  const health = await getSupabaseHealth();
  return (
    <Card className="flex items-center justify-between p-4 text-sm">
      <span className="text-ink">Database</span>
      <span className="flex items-center gap-2 text-muted">
        <span className={`h-2 w-2 rounded-full ${health.ok ? "bg-success" : "bg-danger"}`} aria-hidden />
        {health.ok ? `Connected · ${health.latencyMs} ms` : health.error}
      </span>
    </Card>
  );
}
