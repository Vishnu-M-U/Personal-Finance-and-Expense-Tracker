import type { ReactNode } from "react";

export function Alert({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg bg-expense-50 px-4 py-3 text-sm text-expense-700 ring-1 ring-inset ring-expense-100"
    >
      <span>{children}</span>
      {action}
    </div>
  );
}
