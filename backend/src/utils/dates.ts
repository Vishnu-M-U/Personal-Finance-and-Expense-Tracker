/** Converts a YYYY-MM-DD string to the UTC-midnight Date that Prisma stores in a DATE column. */
export function toDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Converts a DATE column value back to YYYY-MM-DD. */
export function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** First and last day of the month containing `now`, in the server's local time. */
export function currentMonthRange(now = new Date()) {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate: formatLocalDate(first), endDate: formatLocalDate(last) };
}
