"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { formatCurrency } from "@/lib/format";
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
    <main className="grid flex-1 lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 flex justify-center">
              <Logo />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Finance Tracker</h1>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

const FEATURES = [
  "Monthly and custom-period summaries",
  "Spending broken down by category",
  "Private to your account",
];

/** Sample figures for the illustrative preview card. Not real data. */
const PREVIEW_BARS = [
  { name: "Rent & Housing", width: "100%" },
  { name: "Groceries", width: "58%" },
  { name: "Transport", width: "30%" },
];

/** Left half of the sign-in screens on large displays. */
function BrandPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Texture: a soft glow and a faint grid fading toward the bottom. */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-500/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-3">
        <span className="rounded-lg ring-1 ring-white/30">
          <Logo />
        </span>
        <span className="text-lg font-semibold">Finance Tracker</span>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Know where your money goes.
        </h2>
        <p className="mt-4 text-brand-100">
          Record income and expenses in seconds, then see your balance and spending by category at a
          glance.
        </p>

        {/* Illustrative dashboard preview. */}
        <div
          className="mt-10 max-w-sm rounded-2xl bg-white/10 p-5 shadow-2xl ring-1 ring-white/20 backdrop-blur-md"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-100">Net balance</p>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-brand-100">
              This month
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {formatCurrency("54186.55")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 px-3 py-2">
              <p className="text-xs text-brand-100">Income</p>
              <p className="font-medium tabular-nums">{formatCurrency("103000")}</p>
            </div>
            <div className="rounded-lg bg-white/10 px-3 py-2">
              <p className="text-xs text-brand-100">Expenses</p>
              <p className="font-medium tabular-nums">{formatCurrency("48813.45")}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {PREVIEW_BARS.map((bar) => (
              <li key={bar.name}>
                <p className="text-xs text-brand-100">{bar.name}</p>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-white/70" style={{ width: bar.width }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="relative space-y-2 text-sm text-brand-100">
        {FEATURES.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-white/70" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
