const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "INR";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Short form for tight spaces, e.g. "₹1.7L" or "$172.5K". Display only. */
export function formatCompactCurrency(amount: string): string {
  return compactFormatter.format(Number(amount));
}

/** "+15.00%", "−7.40%" or "0.00%". */
export function formatSignedPercent(value: number): string {
  const text = `${Math.abs(value).toFixed(2)}%`;
  return value > 0 ? `+${text}` : value < 0 ? `−${text}` : text;
}

/** Signed money, e.g. "+₹22,500.00" or "−₹1,850.00". Display only. */
export function formatSignedCurrency(amount: string): string {
  if (amount.startsWith("-")) return `−${formatCurrency(amount.slice(1))}`;
  return Number(amount) > 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount);
}

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

/** Formats a signed balance with a true minus sign, e.g. "−₹1,200.00". Display only. */
export function formatBalance(balance: string): string {
  return balance.startsWith("-") ? `−${formatCurrency(balance.slice(1))}` : formatCurrency(balance);
}
