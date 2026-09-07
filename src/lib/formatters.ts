import { Severity, Report, Metric } from '@/types';

export function formatCurrency(amount: number | string | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: num >= 1000 ? 0 : 2,
  }).format(num);
}

export function formatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);

  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  const pct = val * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Returns a human-friendly relative timestamp.
 * Examples: "Just now", "2 min ago", "1 hr ago", "Yesterday", "3 days ago".
 * For entries older than 7 days, returns a short absolute date.
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Safely retrieves a single metric from a report's report_json by metric ID or name substring.
 * Returns null if the metric is not present or has no valid value — never invents data.
 */
export function getReportMetric(report: Report, metricIdOrName: string): Metric | null {
  const metrics = report.report_json?.metrics;
  if (!metrics || metrics.length === 0) return null;
  const lower = metricIdOrName.toLowerCase();
  return (
    metrics.find((m) => m.id === metricIdOrName) ??
    metrics.find((m) => m.name.toLowerCase().includes(lower)) ??
    null
  );
}

/**
 * Extracts up to `limit` meaningful, non-null metrics from a report's report_json.metrics array.
 * Only returns metrics that have an actual value. Never invents or defaults to fake data.
 */
export function extractKeyReportMetrics(report: Report, limit = 3): Metric[] {
  const metrics = report.report_json?.metrics;
  if (!metrics || metrics.length === 0) return [];
  return metrics.filter((m) => m.value !== null && m.value !== undefined).slice(0, limit);
}

/**
 * Determines the human-readable source file type badge for a report.
 * Checks report_json.metadata.fileNames to infer CSV, XLSX, IMAGE, or MIXED.
 */
export function detectSourceFileType(fileNames?: string[]): { label: string; color: string } {
  if (!fileNames || fileNames.length === 0) {
    return { label: 'FILE', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
  }

  const exts = fileNames.map((n) => n.split('.').pop()?.toLowerCase() ?? '');
  const hasImage = exts.some((e) => ['png', 'jpg', 'jpeg', 'webp'].includes(e));
  const hasCsv = exts.some((e) => e === 'csv');
  const hasXlsx = exts.some((e) => e === 'xlsx' || e === 'xls');

  if (hasImage && (hasCsv || hasXlsx)) return { label: 'MIXED', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' };
  if (hasImage) return { label: 'IMAGE', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  if (hasXlsx) return { label: 'XLSX', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (hasCsv) return { label: 'CSV', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
  return { label: 'FILE', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
}

/**
 * Computes truthful dashboard KPI stats from the actual array of stored reports.
 * All values are derived from real persisted data — never invents metrics.
 */
export function computeDashboardStats(reports: Report[]): {
  totalAnalyses: number;
  totalRecordsAnalyzed: number;
  reportsThisMonth: number;
} {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalRecordsAnalyzed = 0;
  let reportsThisMonth = 0;

  for (const r of reports) {
    if (r.status === 'completed') {
      if (r.report_json?.rawData && r.report_json.rawData.length > 0) {
        totalRecordsAnalyzed += r.report_json.rawData.length;
      } else {
        const recordsMetric = r.report_json?.metrics?.find(
          (m) =>
            m.name.toLowerCase().includes('record') ||
            m.name.toLowerCase().includes('rows') ||
            m.id === 'm3'
        );
        if (recordsMetric && typeof recordsMetric.value === 'number') {
          totalRecordsAnalyzed += recordsMetric.value;
        }
      }
    }

    try {
      if (new Date(r.created_at) >= monthStart) {
        reportsThisMonth++;
      }
    } catch {
      /* skip malformed dates */
    }
  }

  return {
    totalAnalyses: reports.length,
    totalRecordsAnalyzed,
    reportsThisMonth,
  };
}

/**
 * Formats a metric value for display, respecting its unit type.
 * Returns '—' when value is null/undefined — never invents a fallback number.
 */
export function formatMetricValue(metric: Metric): string {
  const { value, unit } = metric;
  if (value === null || value === undefined) return '—';
  if (unit === 'USD') return formatCurrency(value);
  if (unit === '%') {
    const num = typeof value === 'string' ? parseFloat(value) : (value as number);
    if (!isNaN(num)) return `${num}%`;
  }
  if (typeof value === 'number') return formatNumber(value);
  return String(value);
}

export function getSeverityBadgeColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'high':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    case 'low':
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
}
