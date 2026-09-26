"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import type { User } from "@/types/api";
import { Logo } from "./Logo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/investments", label: "Investments" },
];

export function Navbar({ user }: { user: User }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* Phones: logo and Log out on top, links on their own row. Wider: one 64px row. */}
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-4 px-4 sm:h-16 sm:flex-nowrap sm:gap-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex h-14 items-center gap-2 sm:h-auto">
          <Logo size="sm" />
          <span className="font-semibold text-slate-900 sm:hidden md:inline">Finance Tracker</span>
        </Link>

        <nav className="order-last -mx-1 flex w-full gap-1 pb-2 sm:order-none sm:mx-0 sm:w-auto sm:pb-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium sm:flex-none",
                pathname.startsWith(link.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 text-sm font-medium text-slate-700 lg:flex">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
              aria-hidden="true"
            >
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            {user.name}
          </span>
          <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
