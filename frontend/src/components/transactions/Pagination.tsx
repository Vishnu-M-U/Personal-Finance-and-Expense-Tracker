import { Button } from "@/components/ui/Button";
import type { PaginationMeta } from "@/types/api";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} />
    </svg>
  );
}

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.total === 0) return null;
  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav
      className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5"
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-500">
        {first > meta.total ? (
          "No results on this page"
        ) : (
          <>
            Showing <span className="font-medium text-slate-900">{first}</span>–
            <span className="font-medium text-slate-900">{last}</span> of{" "}
            <span className="font-medium text-slate-900">{meta.total}</span> transactions
          </>
        )}
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(Math.min(meta.page - 1, meta.totalPages))}
        >
          <Chevron direction="left" />
          Previous
        </Button>
        <span className="px-2 text-sm tabular-nums text-slate-500">
          Page <span className="font-medium text-slate-900">{meta.page}</span> of{" "}
          {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <Chevron direction="right" />
        </Button>
      </div>
    </nav>
  );
}
