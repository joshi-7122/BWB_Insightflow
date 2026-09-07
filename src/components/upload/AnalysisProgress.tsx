import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Brain, BarChart2, ShieldAlert } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  icon: React.ElementType;
}

const STAGES: Stage[] = [
  { id: '1', label: 'Upload received & validated', icon: CheckCircle2 },
  { id: '2', label: 'Parsing data structure & headers', icon: Brain },
  { id: '3', label: 'Identifying business metrics & KPIs', icon: BarChart2 },
  { id: '4', label: 'Detecting statistical anomalies & outliers', icon: ShieldAlert },
  { id: '5', label: 'Generating executive insights & recommendations', icon: Sparkles },
];

export const AnalysisProgress: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        if (onComplete) setTimeout(onComplete, 800);
        return prev;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-lg mx-auto text-center space-y-6 shadow-2xl">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 animate-ping opacity-75" />
        <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Analyzing your business data
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Powered by Advanced Multimodal AI Engine
        </p>
      </div>

      <div className="space-y-3 text-left pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                  : isDone
                  ? 'bg-slate-900/60 border border-slate-800/60 text-slate-300'
                  : 'opacity-40 text-slate-500'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : (
                  <Icon className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
