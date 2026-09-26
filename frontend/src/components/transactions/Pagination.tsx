import { Button } from "@/components/ui/Button";
import type { PaginationMeta } from "@/types/api";

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
      className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3"
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-500">
        {first > meta.total ? (
          "No results on this page"
        ) : (
          <>
            Showing <span className="font-medium text-slate-700">{first}</span>–
            <span className="font-medium text-slate-700">{last}</span> of{" "}
            <span className="font-medium text-slate-700">{meta.total}</span>
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(Math.min(meta.page - 1, meta.totalPages))}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
