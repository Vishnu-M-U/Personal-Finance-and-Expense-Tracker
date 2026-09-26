const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "INR";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a decimal string like "1250.50" for display. Display only — never used for math. */
export function formatCurrency(amount: string): string {
  return currencyFormatter.format(Number(amount));
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a YYYY-MM-DD date for display without timezone shifts. */
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

/** Today's date in the user's local timezone, as YYYY-MM-DD. */
export function todayLocal(): string {
  return toLocalDateString(new Date());
}

export function toLocalDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
