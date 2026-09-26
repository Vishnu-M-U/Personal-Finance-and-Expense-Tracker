import { toLocalDateString } from "./format";

export type PeriodPreset = "thisMonth" | "lastMonth" | "last3Months" | "thisYear" | "custom";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  thisMonth: "This month",
  lastMonth: "Last month",
  last3Months: "Last 3 months",
  thisYear: "This year",
  custom: "Custom",
};

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Date range for a preset, in the user's local timezone. */
export function presetRange(preset: Exclude<PeriodPreset, "custom">, now = new Date()): DateRange {
  const y = now.getFullYear();
  const m = now.getMonth();
  const range = (start: Date, end: Date) => ({
    startDate: toLocalDateString(start),
    endDate: toLocalDateString(end),
  });

  switch (preset) {
    case "thisMonth":
      return range(new Date(y, m, 1), new Date(y, m + 1, 0));
    case "lastMonth":
      return range(new Date(y, m - 1, 1), new Date(y, m, 0));
    case "last3Months":
      // The current month and the two before it.
      return range(new Date(y, m - 2, 1), new Date(y, m + 1, 0));
    case "thisYear":
      return range(new Date(y, 0, 1), new Date(y, 11, 31));
  }
}
