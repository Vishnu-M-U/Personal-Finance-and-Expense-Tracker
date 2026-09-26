import type { ReactNode } from "react";

export function Alert({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200"
    >
      <span>{children}</span>
      {action}
    </div>
  );
}
