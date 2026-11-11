import { Suspense } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · Shiroi Solar ERP" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Brand />
        <Card className="mt-8 p-6">
          <h1 className="text-lg font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Use your Shiroi work account.</p>
          <div className="mt-6">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </Card>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold tracking-[0.3em] text-brand-dark uppercase">Shiroi</p>
      <p className="mt-1 text-2xl font-bold text-ink">Solar ERP</p>
      <p className="mt-1 text-xs text-muted">One platform for rooftop &amp; ground mount solar</p>
    </div>
  );
}
