import type { ReactNode } from "react";

const ICONS = {
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2V3z", "M9 8h6M9 12h6M9 16h3"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-3.5-3.5"],
};

/** Centered icon, title, description and an optional action for "nothing here" states. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span
        className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          {ICONS[icon].map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
