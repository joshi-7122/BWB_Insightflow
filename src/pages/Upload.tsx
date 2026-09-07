import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadDropzone, SelectedFile } from '@/components/upload/UploadDropzone';
import { AnalysisProgress } from '@/components/upload/AnalysisProgress';
import { AnalysisService } from '@/services/analysis.service';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, HelpCircle, AlertCircle } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartAnalysis = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsAnalyzing(true);

    try {
      const validFiles = files.filter((f) => !f.error).map((f) => f.file);
      const userId = user?.id ?? 'demo-user';
      const report = await AnalysisService.analyzeFiles(validFiles, userId, title);

      // Brief pause so progress loader completes all stages
      setTimeout(() => {
        navigate(`/report/${report.id}`);
      }, 1200);
    } catch (err: any) {
      setIsAnalyzing(false);
      const message: string = err?.message ?? 'Analysis failed. Please try again.';
      if (message.includes('not configured')) {
        setError('API key not set. Open your .env file, set GEMINI_API_KEY=your_key, then restart the dev server (npm run dev).');
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/dashboard"
            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            New Business Data Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Upload CSVs, Excel files, or dashboard screenshots for AI-powered analysis.
          </p>
        </div>
      </div>

      {isAnalyzing ? (
        <AnalysisProgress />
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Optional Title input */}
          <div className="glass-panel p-5 rounded-2xl space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Analysis Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Revenue & Regional Breakdown"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Main Upload Dropzone */}
          <UploadDropzone
            files={files}
            onFilesChange={setFiles}
            onAnalyze={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
          />

          {/* How It Works Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>How InsightFlow Works</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-mono text-indigo-400 font-bold">01. Upload</span>
                <p className="text-slate-300">Drop raw spreadsheets or dashboard screenshots without manual formatting.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-mono text-indigo-400 font-bold">02. Multimodal AI</span>
                <p className="text-slate-300">Multimodal AI parses metrics, calculates trends, and flags anomalies from your actual data.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-mono text-indigo-400 font-bold">03. Ask & Act</span>
                <p className="text-slate-300">Interactively ask follow-up questions to dynamically update charts and drill down.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
