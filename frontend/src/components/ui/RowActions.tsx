import { cn } from "@/lib/cn";

const ICONS = {
  edit: "M13.5 4.5l2 2L7 15H5v-2l8.5-8.5z",
  delete: "M5 6h10M8 6V4.5h4V6M6.5 6l.5 10h6l.5-10",
};

/**
 * Quiet edit and delete icon buttons: gray until hovered, so they don't compete with the row.
 * `label` names the row for screen readers, e.g. "Edit Weekly groceries".
 */
export function RowActions({
  label,
  onEdit,
  onDelete,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const base =
    "rounded-md p-1.5 text-slate-400 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600";
  const actions = [
    {
      icon: "edit",
      text: "Edit",
      onClick: onEdit,
      hover: "hover:bg-brand-50 hover:text-brand-600",
    },
    {
      icon: "delete",
      text: "Delete",
      onClick: onDelete,
      hover: "hover:bg-expense-50 hover:text-expense-600",
    },
  ] as const;

  return (
    <div className="flex justify-end gap-0.5">
      {actions.map(({ icon, text, onClick, hover }) => (
        <button
          key={icon}
          type="button"
          onClick={onClick}
          className={cn(base, hover)}
          aria-label={`${text} ${label}`}
          title={text}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[18px]"
            aria-hidden="true"
          >
            <path d={ICONS[icon]} />
          </svg>
        </button>
      ))}
    </div>
  );
}
