"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useAuth";

/** Guest-only pages. Logged-in users are sent to the dashboard. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useMe();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (isPending || user) return <FullPageSpinner />;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Finance Tracker</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
