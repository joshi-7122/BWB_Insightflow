import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Report } from '@/types';
import { AnalysisService } from '@/services/analysis.service';
import { Button } from '@/components/ui/Button';
import { ReportCard } from '@/components/report/ReportCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalysisService.getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRetry = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'processing' as const } : r))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 animate-fade-in-up delay-0">
        <div>
          <h1 className="h-headline text-white">
            All Analytical Reports
          </h1>
          <p className="body-secondary mt-1">
            Persistent archive of all generated business datasets and dashboard analyses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              aria-label="Search reports"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          <Link to="/upload">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up delay-1">
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
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up delay-1">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onRetry={handleRetry}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-sm mx-auto animate-fade-in-up delay-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="h-card text-white">
              {search ? 'No matching reports' : 'No reports found'}
            </h3>
            <p className="body-secondary text-xs">
              {search ? 'Try adjusting your search query.' : 'Upload your first dataset to generate actionable insights.'}
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
  );
};
