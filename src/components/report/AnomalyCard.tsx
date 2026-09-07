import React from 'react';
import { Anomaly } from '@/types';
import { getSeverityBadgeColor } from '@/lib/formatters';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const AnomalyCard: React.FC<{
  anomaly: Anomaly;
  onInvestigate?: (anomaly: Anomaly) => void;
}> = ({ anomaly, onInvestigate }) => {
  const { metric, description, severity, detectedPeriod, magnitude, confidence } = anomaly;

  return (
    <div className="glass-card p-5 rounded-2xl space-y-3 border-l-4 border-l-amber-500 bg-amber-500/5 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white font-mono-label">{metric}</span>
        </div>
        <Badge className={getSeverityBadgeColor(severity)}>
          {severity.toUpperCase()}
        </Badge>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>

      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-3 font-mono-label">
          {detectedPeriod && (
            <span>
              Period: <strong className="text-slate-200">{detectedPeriod}</strong>
            </span>
          )}
          {magnitude && (
            <span>
              Magnitude: <strong className="text-amber-400">{magnitude}x</strong>
            </span>
          )}
          {confidence && (
            <span>
              Confidence: <strong className="text-indigo-400">{(confidence * 100).toFixed(0)}%</strong>
            </span>
          )}
        </div>

        {onInvestigate && (
          <button
            onClick={() => onInvestigate(anomaly)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Investigate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
