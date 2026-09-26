import { Card, CardHeader } from "@/components/ui/Card";
import { RowActions } from "@/components/ui/RowActions";
import { INVESTMENT_TYPE_META } from "@/lib/investments";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Investment } from "@/types/api";
import { InvestmentIcon } from "./InvestmentIcon";
import { ReturnValue } from "./ReturnValue";

interface Props {
  investments: Investment[];
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
}

/** "Updated 26 Sept 2026", from the ISO timestamp. */
function updatedLabel(iso: string) {
  return `Updated ${formatDate(iso.slice(0, 10))}`;
}

function TypeChip({ investment }: { investment: Investment }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {INVESTMENT_TYPE_META[investment.type].label}
    </span>
  );
}

export function InvestmentTable({ investments, onEdit, onDelete }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 pb-4 pt-5 sm:px-6">
        <CardHeader
          title="My investments"
          subtitle={`${investments.length} ${investments.length === 1 ? "holding" : "holdings"}`}
        />
      </div>

      {/* Desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="py-3 pl-6 pr-4 font-medium">
              Investment
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Invested
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Current value
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Return
            </th>
            <th scope="col" className="py-3 pl-4 pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {investments.map((i) => (
            <tr key={i.id} className="transition-colors hover:bg-slate-50">
              <td className="py-3 pl-6 pr-4">
                <div className="flex items-center gap-3">
                  <InvestmentIcon type={i.type} />
                  <div className="min-w-0">
                    <p className="max-w-xs truncate font-medium text-slate-900">{i.name}</p>
                    <p className="text-xs text-slate-500">{updatedLabel(i.updatedAt)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <TypeChip investment={i} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-600">
                {formatCurrency(i.investedAmount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                {formatCurrency(i.currentValue)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <ReturnValue amount={i.returnAmount} percentage={i.returnPercentage} />
              </td>
              <td className="py-3 pl-4 pr-6">
                <RowActions label={i.name} onEdit={() => onEdit(i)} onDelete={() => onDelete(i)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 border-t border-slate-200 md:hidden">
        {investments.map((i) => (
          <li key={i.id} className="flex gap-3 px-4 py-4">
            <InvestmentIcon type={i.type} className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{i.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {INVESTMENT_TYPE_META[i.type].label} · {updatedLabel(i.updatedAt)}
                  </p>
                </div>
                <ReturnValue
                  amount={i.returnAmount}
                  percentage={i.returnPercentage}
                  className="shrink-0 text-sm"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <p className="tabular-nums text-slate-500">
                  {formatCurrency(i.investedAmount)}
                  <span className="mx-1.5 text-slate-300">→</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(i.currentValue)}
                  </span>
                </p>
                <RowActions label={i.name} onEdit={() => onEdit(i)} onDelete={() => onDelete(i)} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
