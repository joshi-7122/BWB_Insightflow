import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Report, ChartDefinition } from '@/types';
import { AnalysisService } from '@/services/analysis.service';
import { KPICard } from '@/components/report/KPICard';
import { AnomalyCard } from '@/components/report/AnomalyCard';
import { InsightCard } from '@/components/report/InsightCard';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/formatters';
import {
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Calendar,
  FileText,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  Share2,
  Download,
  Printer,
  Table as TableIcon,
  BarChart2,
  Check,
} from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeMainChart, setActiveMainChart] = useState<ChartDefinition | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    AnalysisService.getReportById(id).then((data) => {
      setReport(data);
      if (data?.report_json?.charts?.[0]) {
        setActiveMainChart(data.report_json.charts[0]);
      }
      setLoading(false);
    });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!report || !report.report_json) {
    return (
      <div className="text-center py-20 space-y-4">
        <h3 className="h-section text-white">Report not found</h3>
        <p className="body-secondary">
          The requested analytical report does not exist or has been removed.
        </p>
        <Link to="/dashboard">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const data = report.report_json;
  const rawTableData = data.rawData && data.rawData.length > 0 ? data.rawData : (data.charts?.[0]?.data ?? []);
  const tableHeaders = rawTableData.length > 0 ? Object.keys(rawTableData[0]) : [];

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 animate-fade-in-up delay-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-indigo-400 font-mono">Report #{report.id.slice(-6)}</span>
          </div>

          <h1 className="h-headline text-white">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(report.created_at)}
            </span>
            {data.metadata?.fileNames && (
              <span className="inline-flex items-center gap-1 font-mono text-slate-400">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                {data.metadata.fileNames.join(', ')}
              </span>
            )}
            <Badge variant="success">Analyzed</Badge>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          >
            {copiedLink ? 'Link Copied!' : 'Share'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print / PDF
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${data.title.toLowerCase().replace(/\s+/g, '_')}_report.json`;
              a.click();
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export JSON
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsChatOpen(true)}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            Ask Questions
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs (Dashboard vs Raw Table) */}
      <div className="flex items-center justify-between no-print animate-fade-in-up delay-1">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Executive Dashboard
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Data Table ({rawTableData.length})
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          {/* Executive Summary */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500 space-y-3 relative overflow-hidden animate-fade-in-up delay-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Executive Summary
                </h3>
              </div>
              {data.confidence && (
                <Badge variant="gradient">
                  {(data.confidence * 100).toFixed(0)}% AI Confidence
                </Badge>
              )}
            </div>
            <p className="text-base text-slate-200 leading-relaxed font-normal">{data.summary}</p>
          </div>

          {/* KPI Cards Grid */}
          <div className="space-y-3 animate-fade-in-up delay-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Key Performance Indicators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.metrics?.map((metric) => (
                <KPICard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>

          {/* Visualizations & Insights Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-3">
            {/* Main Chart Card (2 cols) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="h-card text-white">
                    {activeMainChart?.title || 'Data Visualization'}
                  </h3>
                  {activeMainChart?.description && (
                    <p className="body-secondary text-xs">{activeMainChart.description}</p>
                  )}
                </div>

                {/* Chart switcher tabs */}
                {data.charts && data.charts.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {data.charts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveMainChart(c)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                          activeMainChart?.id === c.id
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {c.title.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeMainChart && <ChartRenderer chart={activeMainChart} height={320} />}
            </div>

            {/* Insights Column (1 col) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span>Key Insights</span>
              </h3>
              <div className="space-y-4">
                {data.insights?.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>

          {/* Anomalies Section */}
          {data.anomalies && data.anomalies.length > 0 && (
            <div className="space-y-4 animate-fade-in-up delay-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Detected Anomalies & Outliers ({data.anomalies.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.anomalies.map((anomaly) => (
                  <AnomalyCard
                    key={anomaly.id}
                    anomaly={anomaly}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Raw Data Table View */
        <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in-up delay-1">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="h-card text-white">Source Dataset Records</h3>
            <span className="text-xs text-slate-500 font-mono">{rawTableData.length} records parsed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {rawTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {tableHeaders.map((header) => (
                      <td key={header} className="px-4 py-2.5 whitespace-nowrap">
                        {String(row[header] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <Button
          size="lg"
          variant="primary"
          onClick={() => setIsChatOpen(true)}
          leftIcon={<MessageSquare className="w-5 h-5" />}
          className="shadow-xl shadow-indigo-600/30 rounded-full"
        >
          Ask InsightFlow
        </Button>
      </div>

      {/* Chat Side Drawer */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        reportId={report.id}
        reportData={data}
      />
    </div>
  );
};
