"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { data: user, isPending, isError } = useMe();

  useEffect(() => {
    if (isPending) return;
    router.replace(user && !isError ? "/dashboard" : "/login");
  }, [user, isPending, isError, router]);

  return <FullPageSpinner />;
}
