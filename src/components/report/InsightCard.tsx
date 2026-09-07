import React from 'react';
import { Insight } from '@/types';
import { Lightbulb, CheckCircle } from 'lucide-react';

export const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const { observation, interpretation, confidence, category } = insight;

  return (
    <div className="glass-card p-5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {category || 'Analytical Insight'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{(confidence * 100).toFixed(0)}% Confidence</span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Observation:
          </span>
          <p className="text-sm font-medium text-slate-200 mt-0.5">{observation}</p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Interpretation:
          </span>
          <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{interpretation}</p>
        </div>
      </div>
    </div>
  );
};
