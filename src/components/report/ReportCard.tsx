import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Report } from '@/types';
import {
  formatRelativeTime,
  formatDate,
  detectSourceFileType,
  extractKeyReportMetrics,
  formatMetricValue,
} from '@/lib/formatters';
import {
  ArrowRight,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ReportCardProps {
  report: Report;
  onRetry?: (reportId: string) => void;
}

const StatusDot: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const configs: Record<Report['status'], { dot: string; label: string; text: string }> = {
    completed: {
      dot: 'bg-emerald-400',
      label: 'Analyzed',
      text: 'text-emerald-400',
    },
    processing: {
      dot: 'bg-amber-400 animate-pulse',
      label: 'Processing',
      text: 'text-amber-400',
    },
    pending: {
      dot: 'bg-slate-500 animate-pulse',
      label: 'Pending',
      text: 'text-slate-400',
    },
    failed: {
      dot: 'bg-rose-500',
      label: 'Failed',
      text: 'text-rose-400',
    },
  };

  const cfg = configs[status] ?? configs.pending;

  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-[11px] font-medium', cfg.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const FileTypeBadge: React.FC<{ fileNames?: string[] }> = ({ fileNames }) => {
  const { label, color } = detectSourceFileType(fileNames);

  const iconMap: Record<string, React.ReactNode> = {
    CSV: <FileSpreadsheet className="w-3 h-3" />,
    XLSX: <FileSpreadsheet className="w-3 h-3" />,
    IMAGE: <ImageIcon className="w-3 h-3" />,
    MIXED: <File className="w-3 h-3" />,
    FILE: <File className="w-3 h-3" />,
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border group-hover:ring-1 group-hover:ring-current/25 transition-all duration-150',
        color
      )}
    >
      {iconMap[label] ?? <File className="w-3 h-3" />}
      {label}
    </span>
  );
};

export const ReportCard: React.FC<ReportCardProps> = ({ report, onRetry }) => {
  const navigate = useNavigate();
  const fileNames = report.report_json?.metadata?.fileNames;
  const keyMetrics = extractKeyReportMetrics(report, 3);
  const relativeTime = formatRelativeTime(report.created_at);
  const exactTime = formatDate(report.created_at);

  const rawRecordCount =
    report.report_json?.rawData?.length ??
    ((): number | null => {
      const m = report.report_json?.metrics?.find(
        (met) =>
          met.name.toLowerCase().includes('record') ||
          met.name.toLowerCase().includes('rows') ||
          met.id === 'm3'
      );
      return m && typeof m.value === 'number' ? m.value : null;
    })();

  const isProcessing = report.status === 'processing' || report.status === 'pending';
  const isFailed = report.status === 'failed';
  const isCompleted = report.status === 'completed';

  const handleClick = () => {
    if (isCompleted) {
      navigate(`/report/${report.id}`);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.(report.id);
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'glass-card rounded-2xl flex flex-col group transition-all duration-200',
        isCompleted && 'cursor-pointer hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5',
        isFailed && 'border-rose-500/20',
        isProcessing && 'opacity-75'
      )}
    >
      {/* Card Header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FileTypeBadge fileNames={fileNames} />
          <StatusDot status={report.status} />
        </div>
        <span
          className="text-[11px] text-slate-500 font-mono shrink-0 cursor-default"
          title={exactTime}
        >
          {relativeTime}
        </span>
      </div>

      {/* Title & Record Count */}
      <div className="px-5 pb-3">
        <h3
          className={clsx(
            'text-[15px] font-semibold leading-snug line-clamp-1 transition-colors duration-150',
            isCompleted
              ? 'text-white group-hover:text-indigo-300'
              : 'text-slate-300'
          )}
        >
          {report.title}
        </h3>
        {rawRecordCount !== null && (
          <p className="text-[12px] text-slate-500 mt-0.5 font-mono">
            {rawRecordCount.toLocaleString()} records
          </p>
        )}
      </div>

      {/* Metrics Row — only from real report_json data */}
      {isCompleted && keyMetrics.length > 0 && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/70">
            {keyMetrics.map((metric) => (
              <div key={metric.id} className="min-w-0">
                <p className="text-[13px] font-bold text-white group-hover:text-indigo-100 font-mono leading-tight truncate transition-colors duration-150">
                  {formatMetricValue(metric)}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                  {metric.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800/70">
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-[11px] text-amber-400">Analysis in progress…</span>
          </div>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between pt-3 border-t border-rose-500/20">
            <span className="flex items-center gap-1.5 text-[11px] text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Analysis failed
            </span>
            {onRetry && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      {isCompleted && (
        <div className="px-5 py-3 mt-auto border-t border-slate-800/60 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Open Report
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform duration-150 cubic-bezier(0.16,1,0.3,1)" />
        </div>
      )}
    </div>
  );
};
