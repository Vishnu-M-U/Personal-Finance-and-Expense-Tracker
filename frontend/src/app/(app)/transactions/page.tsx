import { Suspense } from "react";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { TransactionsView } from "./TransactionsView";

export default function TransactionsPage() {
  // useSearchParams (for URL filters) requires a Suspense boundary.
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <TransactionsView />
    </Suspense>
  );
}
