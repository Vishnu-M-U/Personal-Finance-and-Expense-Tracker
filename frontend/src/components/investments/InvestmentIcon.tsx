import { INVESTMENT_TYPE_META } from "@/lib/investments";
import { cn } from "@/lib/cn";
import type { InvestmentType } from "@/types/api";

/** Type icon on its light chip. */
export function InvestmentIcon({ type, className }: { type: InvestmentType; className?: string }) {
  const meta = INVESTMENT_TYPE_META[type];
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        meta.soft,
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        {meta.icon.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
