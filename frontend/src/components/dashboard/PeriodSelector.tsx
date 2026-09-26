"use client";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PERIOD_LABELS, type DateRange, type PeriodPreset } from "@/lib/periods";

interface Props {
  preset: PeriodPreset;
  customRange: DateRange;
  onPresetChange: (preset: PeriodPreset) => void;
  onCustomRangeChange: (range: DateRange) => void;
}

/** Period buttons styled for the indigo dashboard hero. */
export function PeriodSelector({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div
        role="radiogroup"
        aria-label="Period"
        className="flex flex-wrap gap-1 self-start rounded-lg bg-white/10 p-1 ring-1 ring-inset ring-white/20"
      >
        {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={preset === key}
            onClick={() => onPresetChange(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white",
              preset === key
                ? "bg-white text-brand-700 shadow-sm"
                : "text-brand-100 hover:bg-white/10 hover:text-white",
            )}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="period-start" className="sr-only">
            Start date
          </label>
          <div className="w-44">
            <Input
              id="period-start"
              type="date"
              value={customRange.startDate}
              max={customRange.endDate || undefined}
              onChange={(e) => onCustomRangeChange({ ...customRange, startDate: e.target.value })}
            />
          </div>
          <span className="text-sm text-brand-100">to</span>
          <label htmlFor="period-end" className="sr-only">
            End date
          </label>
          <div className="w-44">
            <Input
              id="period-end"
              type="date"
              value={customRange.endDate}
              min={customRange.startDate || undefined}
              onChange={(e) => onCustomRangeChange({ ...customRange, endDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
