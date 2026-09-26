import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const controlClass =
  "block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-shadow placeholder:text-slate-400 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:ring-expense-600";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, "pr-8", className)} {...props} />;
}
