import React from 'react';
import { Metric } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters';
import { useCountUp } from '@/hooks/useCountUp';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const KPICard: React.FC<{ metric: Metric }> = ({ metric }) => {
  const { name, value, unit, period, change, comparisonPeriod } = metric;

  const isPositive = change !== undefined && change !== null && change > 0;
  const isNegative = change !== undefined && change !== null && change < 0;

  const numericVal = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN;
  const isAnimatable = !isNaN(numericVal);
  const animatedVal = useCountUp(isAnimatable ? numericVal : 0, 750);

  const displayVal = isAnimatable
    ? unit === 'USD'
      ? formatCurrency(animatedVal)
      : formatNumber(animatedVal)
    : String(value ?? '—');

  return (
    <div className="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden group">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {name}
        </span>
        {period && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {period}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {displayVal}
        </h4>

        {change !== undefined && change !== null && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{formatPercent(change)}</span>
          </div>
        )}
      </div>

      {comparisonPeriod && (
        <p className="text-[11px] text-slate-500 font-sans">
          {comparisonPeriod}
        </p>
      )}
    </div>
  );
};
