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

export function PeriodSelector({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <div
        role="radiogroup"
        aria-label="Period"
        className="flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200"
      >
        {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={preset === key}
            onClick={() => onPresetChange(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              preset === key
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <label htmlFor="period-start" className="sr-only">
            Start date
          </label>
          <Input
            id="period-start"
            type="date"
            className="w-auto"
            value={customRange.startDate}
            max={customRange.endDate || undefined}
            onChange={(e) => onCustomRangeChange({ ...customRange, startDate: e.target.value })}
          />
          <span className="text-sm text-slate-500">to</span>
          <label htmlFor="period-end" className="sr-only">
            End date
          </label>
          <Input
            id="period-end"
            type="date"
            className="w-auto"
            value={customRange.endDate}
            min={customRange.startDate || undefined}
            onChange={(e) => onCustomRangeChange({ ...customRange, endDate: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
