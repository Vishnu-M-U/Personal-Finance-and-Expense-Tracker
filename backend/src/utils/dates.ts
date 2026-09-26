/** Converts a YYYY-MM-DD string to the UTC-midnight Date that Prisma stores in a DATE column. */
export function toDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Converts a DATE column value back to YYYY-MM-DD. */
export function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
