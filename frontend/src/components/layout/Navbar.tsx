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
];

export function Navbar({ user }: { user: User }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="hidden font-semibold text-slate-900 sm:inline">Finance Tracker</span>
        </Link>

        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                pathname.startsWith(link.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 md:inline">{user.name}</span>
          <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
