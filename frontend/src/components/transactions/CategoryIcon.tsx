import { cn } from "@/lib/cn";

/** Outline icons (24×24, stroke) for the predefined categories. Unknown names get a tag. */
const ICONS: Record<string, string[]> = {
  Salary: ["M3 7h18v10H3z", "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M6 10v.01M18 14v.01"],
  Freelance: ["M4 8h16v11H4z", "M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2", "M4 13h16"],
  Business: ["M5 21V4h10v17", "M15 9h4v12", "M3 21h18", "M8 8h4M8 12h4M8 16h4"],
  Investments: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  Gifts: [
    "M4 9h16v4H4z",
    "M6 13v8h12v-8",
    "M12 9v12",
    "M12 9c-4 0-5.5-4-3-4.5S12 9 12 9zm0 0c4 0 5.5-4 3-4.5S12 9 12 9z",
  ],
  "Food & Dining": ["M7 3v18", "M4 3v5a3 3 0 0 0 6 0V3", "M17 21V3c-2 1-3 3.5-3 7s1 4 3 4"],
  Groceries: [
    "M3 4h2l2.5 11h10L20 7H6",
    "M9.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  ],
  Transportation: ["M5 16V11l2-5h10l2 5v5", "M3 16h18v3H3z", "M5 11h14", "M7 19v2M17 19v2"],
  "Rent & Housing": ["M3 11l9-8 9 8", "M5 9.5V21h5v-6h4v6h5V9.5"],
  Utilities: ["M13 2L4 14h7l-1 8 9-12h-7l1-8z"],
  Healthcare: [
    "M12 20s-8-4.5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.5 12 20 12 20z",
    "M9 12h6M12 9v6",
  ],
  Entertainment: ["M3 5h18v14H3z", "M7 5v14M17 5v14", "M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"],
  Shopping: ["M5 8h14l-1 13H6L5 8z", "M9 8V7a3 3 0 0 1 6 0v1"],
  Education: ["M2 9l10-5 10 5-10 5L2 9z", "M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5", "M22 9v5"],
  Travel: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    "M3 12h18",
    "M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  ],
  "Bills & Subscriptions": ["M6 3h12v18l-3-2-3 2-3-2-3 2V3z", "M9 8h6M9 12h6M9 16h3"],
  "Other Income": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 8v8M8 12h8"],
  "Other Expense": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M8 12h.01M12 12h.01M16 12h.01"],
};

const FALLBACK = ["M3 12V4h8l10 10-8 8L3 12z", "M7.5 8.5h.01"];

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden="true"
    >
      {(ICONS[name] ?? FALLBACK).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
