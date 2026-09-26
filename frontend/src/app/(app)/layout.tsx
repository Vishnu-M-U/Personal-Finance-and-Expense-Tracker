"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/api";

/** Authenticated pages. Logged-out users are sent to /login. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending, isError, error, refetch } = useMe();

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-24">
        <Alert
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      </main>
    );
  }

  if (isPending || !user) return <FullPageSpinner />;

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </>
  );
}
