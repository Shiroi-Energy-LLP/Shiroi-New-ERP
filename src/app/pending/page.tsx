import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth-actions";

export default function PendingPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm p-6 text-center">
        <h1 className="text-lg font-semibold text-ink">Account not active yet</h1>
        <p className="mt-2 text-sm text-muted">
          You&apos;re signed in, but an administrator still needs to give your account a role. Please contact your
          manager.
        </p>
        <form action={signOut} className="mt-6">
          <Button variant="secondary" type="submit" className="w-full">
            Sign out
          </Button>
        </form>
      </Card>
    </main>
  );
}
