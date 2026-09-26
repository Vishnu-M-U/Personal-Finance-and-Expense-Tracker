import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  /** First name for the greeting, if known. */
  firstName?: string;
  /** The selected range, already formatted. */
  rangeLabel: string;
  /** The period selector. */
  children: ReactNode;
  onAdd: () => void;
}

/** Colored header of the dashboard: greeting, title, date range, period controls, add button. */
export function DashboardHero({ firstName, rangeLabel, children, onAdd }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-600 px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
      {/* Two soft circles for depth; flat fills, no blur. */}
      <div
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 right-40 size-56 rounded-full bg-violet-400/20"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {firstName && (
              <p className="text-sm font-medium text-brand-100">Welcome back, {firstName}</p>
            )}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-100">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  d="M4 5h12v11H4zM4 8.5h12M7 3v3M13 3v3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {rangeLabel}
            </p>
          </div>
          <Button variant="inverse" className="self-start" onClick={onAdd}>
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add transaction
          </Button>
        </div>
        {children}
      </div>
    </section>
  );
}
