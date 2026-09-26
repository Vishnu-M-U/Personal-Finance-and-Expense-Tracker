"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { hasActiveFilters, type TransactionFilters } from "@/lib/transactionFilters";
import type { Category, TransactionType } from "@/types/api";

type FilterChanges = Partial<Omit<TransactionFilters, "page" | "sortBy" | "sortOrder">>;

interface Props {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (changes: FilterChanges) => void;
  onClear: () => void;
}

const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export function TransactionFiltersBar({ filters, categories, onChange, onClear }: Props) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [syncedSearch, setSyncedSearch] = useState(filters.search);

  // Keep the box in sync when the URL changes elsewhere (e.g. "Clear filters", back button).
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setSearch(filters.search ?? "");
  }

  // Debounce typing so we don't hit the API on every keystroke.
  useEffect(() => {
    const value = search.trim() || undefined;
    if (value === filters.search) return;
    const timer = setTimeout(() => onChange({ search: value }), 300);
    return () => clearTimeout(timer);
  }, [search, filters.search, onChange]);

  const visibleCategories = filters.type
    ? categories.filter((c) => c.type === filters.type)
    : categories;

  const changeType = (value: string) => {
    const type = (value || undefined) as TransactionType | undefined;
    const selected = categories.find((c) => c.id === filters.categoryId);
    // Drop a category filter that doesn't belong to the new type.
    const categoryId = selected && type && selected.type !== type ? undefined : filters.categoryId;
    onChange({ type, categoryId });
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:items-end">
      <div className="col-span-2">
        <label htmlFor="filter-search" className={labelClass}>
          Search
        </label>
        <Input
          id="filter-search"
          type="search"
          placeholder="Search descriptions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filter-type" className={labelClass}>
          Type
        </label>
        <Select
          id="filter-type"
          value={filters.type ?? ""}
          onChange={(e) => changeType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </Select>
      </div>
      <div>
        <label htmlFor="filter-category" className={labelClass}>
          Category
        </label>
        <Select
          id="filter-category"
          value={filters.categoryId ?? ""}
          onChange={(e) =>
            onChange({ categoryId: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">All categories</option>
          {visibleCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-start" className={labelClass}>
          From
        </label>
        <Input
          id="filter-start"
          type="date"
          value={filters.startDate ?? ""}
          max={filters.endDate}
          onChange={(e) => onChange({ startDate: e.target.value || undefined })}
        />
      </div>
      <div>
        <label htmlFor="filter-end" className={labelClass}>
          To
        </label>
        <Input
          id="filter-end"
          type="date"
          value={filters.endDate ?? ""}
          min={filters.startDate}
          onChange={(e) => onChange({ endDate: e.target.value || undefined })}
        />
      </div>
      {hasActiveFilters(filters) && (
        <div className="col-span-2 md:col-span-6">
          <Button variant="ghost" className="-ml-2 px-2 py-1" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
