import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Report } from '@/types';
import { AnalysisService } from '@/services/analysis.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportCard } from '@/components/report/ReportCard';
import { useCountUp } from '@/hooks/useCountUp';
import {
  computeDashboardStats,
  formatNumber,
  formatDate,
  formatRelativeTime,
} from '@/lib/formatters';
import {
  Sparkles,
  Plus,
  Search,
  BarChart3,
  FileSpreadsheet,
  Database,
  CalendarDays,
} from 'lucide-react';
import { clsx } from 'clsx';

// ── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ── Dashboard KPI Card ───────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
  subLabel?: string;
  delayClass?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  iconBg,
  loading,
  subLabel,
  delayClass = 'delay-1',
}) => {
  const animatedValue = useCountUp(value, 750);

  return (
    <div
      className={clsx(
        'glass-card p-5 rounded-2xl flex items-center gap-4 min-w-0 animate-fade-in-up',
        delayClass
      )}
    >
      <div
        className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner',
          iconBg
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-extrabold text-white font-mono leading-tight tracking-tight">
            {formatNumber(animatedValue)}
          </p>
        )}
        {subLabel && !loading && (
          <p className="text-[10px] text-slate-500 mt-0.5">{subLabel}</p>
        )}
      </div>
    </div>
  );
};

// ── Recent Activity Feed ──────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  type: 'completed' | 'failed' | 'created';
  reportTitle: string;
  reportId: string;
  timestamp: string;
}

function deriveActivityFromReports(reports: Report[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const r of reports.slice(0, 8)) {
    if (r.status === 'completed') {
      items.push({
        id: `completed-${r.id}`,
        type: 'completed',
        reportTitle: r.title,
        reportId: r.id,
        timestamp: r.updated_at ?? r.created_at,
      });
    } else if (r.status === 'failed') {
      items.push({
        id: `failed-${r.id}`,
        type: 'failed',
        reportTitle: r.title,
        reportId: r.id,
        timestamp: r.updated_at ?? r.created_at,
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    AnalysisService.getReports(user?.id).then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, [user?.id]);

  const filteredReports = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q)
    );
  }, [reports, search]);

  const stats = useMemo(() => computeDashboardStats(reports), [reports]);
  const activityItems = useMemo(() => deriveActivityFromReports(reports), [reports]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Analyst';

  const handleRetry = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'processing' as const } : r))
    );
    AnalysisService.getReportById(reportId).then((report) => {
      if (report) {
        console.log('[InsightFlow] Retry queued for:', reportId);
      }
    });
  };

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  return (
    <div className="space-y-8 pb-12">

      {/* ── Hero / Welcome Banner ─────────────────────────────────────────── */}
      <div className="glass-panel p-7 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t-white/10 animate-fade-in-up delay-0">
        {/* Soft Radial Ambient Spotlight Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 z-10 max-w-xl">
          {/* AI Workspace Indicator */}
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI Workspace Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {getGreeting()}, <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">{userName}</span>.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Upload business spreadsheets or dashboard screenshots to generate structured executive summaries, KPI metrics, and conversational follow-ups.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Link to="/upload">
            <Button size="lg" variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards (Animated Count-Up + Staggered Entrance) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Analyses"
          value={stats.totalAnalyses}
          loading={loading}
          icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-indigo-500/10 border border-indigo-500/20"
          delayClass="delay-1"
        />
        <KpiCard
          label="Records Analyzed"
          value={stats.totalRecordsAnalyzed}
          loading={loading}
          icon={<Database className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10 border border-emerald-500/20"
          subLabel="From completed analyses"
          delayClass="delay-2"
        />
        <KpiCard
          label={`Reports in ${currentMonth}`}
          value={stats.reportsThisMonth}
          loading={loading}
          icon={<CalendarDays className="w-5 h-5 text-violet-400" />}
          iconBg="bg-violet-500/10 border border-violet-500/20"
          subLabel="This month"
          delayClass="delay-3"
        />
      </div>

      {/* ── Recent Reports Grid ───────────────────────────────────────────── */}
      <div className="space-y-4 animate-fade-in-up delay-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Reports</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {reports.length > 0
                ? `${reports.length} ${reports.length === 1 ? 'report' : 'reports'} total`
                : 'No reports yet'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter reports…"
              aria-label="Filter reports"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500/60 transition-colors duration-150"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/70">
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onRetry={handleRetry}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {search ? 'No matching reports' : 'No reports yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                {search
                  ? 'Try a different search term.'
                  : 'Upload your first dataset to generate structured analytics.'}
              </p>
            </div>
            {!search && (
              <Link to="/upload">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  New Analysis
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Activity Feed ─────────────────────────────────────────── */}
      {!loading && activityItems.length > 0 && (
        <div className="space-y-3 animate-fade-in-up delay-5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recent Activity
          </h2>
          <div className="glass-card rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
            {activityItems.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      item.type === 'completed' && 'bg-emerald-400',
                      item.type === 'failed' && 'bg-rose-400',
                      item.type === 'created' && 'bg-indigo-400'
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{item.reportTitle}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.type === 'completed' && 'Analysis completed'}
                      {item.type === 'failed' && 'Analysis failed'}
                      {item.type === 'created' && 'Report created'}
                    </p>
                  </div>
                </div>
                <span
                  className="text-[11px] text-slate-500 font-mono shrink-0"
                  title={formatDate(item.timestamp)}
                >
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
