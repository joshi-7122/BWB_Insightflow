import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { ChartDefinition } from '@/types';
import {
  Sparkles,
  ArrowRight,
  Upload,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Zap,
  Brain,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';

const SAMPLE_DATASETS: Record<
  string,
  {
    label: string;
    title: string;
    confidence: number;
    metrics: Array<{ name: string; value: string; change: string; up: boolean }>;
    chart: ChartDefinition;
    anomaly: string;
  }
> = {
  saas: {
    label: '📊 Business Revenue',
    title: 'Business Revenue & Growth Performance',
    confidence: 0.94,
    metrics: [
      { name: 'Total Revenue', value: '$1.42M', change: '+14.2%', up: true },
      { name: 'Client Retention Rate', value: '94.8%', change: '+2.1%', up: true },
      { name: 'Customer Acq Cost (CAC)', value: '$420', change: '-8.5%', up: true },
      { name: 'Active Clients', value: '1,240', change: '+6.5%', up: true },
    ],
    chart: {
      id: 'landing-saas-chart',
      type: 'area',
      title: 'Monthly Recurring Revenue ($K)',
      xAxisKey: 'Month',
      dataKeys: ['MRR ($K)', 'Expansion ($K)'],
      data: [
        { Month: 'Jan', 'MRR ($K)': 95, 'Expansion ($K)': 18 },
        { Month: 'Feb', 'MRR ($K)': 110, 'Expansion ($K)': 22 },
        { Month: 'Mar', 'MRR ($K)': 104, 'Expansion ($K)': 15 },
        { Month: 'Apr', 'MRR ($K)': 125, 'Expansion ($K)': 28 },
        { Month: 'May', 'MRR ($K)': 142, 'Expansion ($K)': 34 },
        { Month: 'Jun', 'MRR ($K)': 158, 'Expansion ($K)': 41 },
      ],
    },
    anomaly: 'SMB tier churn spiked +24% in March — 2.1× standard variance.',
  },
  ecommerce: {
    label: '🛍️ E-Commerce Sales',
    title: 'E-Commerce Store Regional Performance',
    confidence: 0.96,
    metrics: [
      { name: 'Total Revenue', value: '$348,200', change: '+22.4%', up: true },
      { name: 'Avg Order Value (AOV)', value: '$84.50', change: '+5.2%', up: true },
      { name: 'Cart Abandonment', value: '62.1%', change: '-4.1%', up: true },
      { name: 'Total Orders', value: '4,120', change: '+18.0%', up: true },
    ],
    chart: {
      id: 'landing-ecom-chart',
      type: 'bar',
      title: 'Weekly Sales Breakdown ($K)',
      xAxisKey: 'Week',
      dataKeys: ['Direct ($K)', 'Social ($K)'],
      data: [
        { Week: 'Wk 1', 'Direct ($K)': 42, 'Social ($K)': 28 },
        { Week: 'Wk 2', 'Direct ($K)': 55, 'Social ($K)': 34 },
        { Week: 'Wk 3', 'Direct ($K)': 49, 'Social ($K)': 31 },
        { Week: 'Wk 4', 'Direct ($K)': 68, 'Social ($K)': 45 },
        { Week: 'Wk 5', 'Direct ($K)': 72, 'Social ($K)': 51 },
      ],
    },
    anomaly: 'Mobile conversion rate dropped -15% during Week 3 promo campaign.',
  },
  marketing: {
    label: '📈 Ad Campaign ROI',
    title: 'Multi-Channel Marketing Performance',
    confidence: 0.91,
    metrics: [
      { name: 'Total Ad Spend', value: '$45,000', change: '+10.0%', up: false },
      { name: 'Cost Per Lead (CPL)', value: '$18.40', change: '-12.3%', up: true },
      { name: 'Blended ROAS', value: '3.8x', change: '+0.4x', up: true },
      { name: 'Qualified Leads', value: '2,445', change: '+28.1%', up: true },
    ],
    chart: {
      id: 'landing-mktg-chart',
      type: 'line',
      title: 'Channel Conversion Rates (%)',
      xAxisKey: 'Channel',
      dataKeys: ['Conversion (%)'],
      data: [
        { Channel: 'Google Search', 'Conversion (%)': 4.8 },
        { Channel: 'LinkedIn Ads', 'Conversion (%)': 3.9 },
        { Channel: 'Meta Ads', 'Conversion (%)': 2.6 },
        { Channel: 'Newsletter', 'Conversion (%)': 6.2 },
        { Channel: 'Organic', 'Conversion (%)': 5.1 },
      ],
    },
    anomaly: 'Meta Ads Customer Acquisition Cost increased 32% post privacy update.',
  },
};

const FEATURES = [
  {
    icon: Upload,
    title: 'Drop Any Data Format',
    desc: 'CSV spreadsheets, Excel workbooks, or dashboard screenshots — paste without manual formatting.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Brain,
    title: 'Multimodal AI Engine',
    desc: 'Reads tabular numbers and visual image charts. Extracts KPIs, computes changes, and flags anomalies.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: BarChart3,
    title: 'Interactive Recharts',
    desc: 'Auto-generated Area, Bar, Line, and Donut visualizations built directly from your uploaded data.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Anomaly & Outlier Alerts',
    desc: 'Statistical outliers surfaced automatically with severity classification and period context.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Conversational Analysis',
    desc: 'Ask follow-up questions in plain language. The AI answers using your actual report metrics.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    desc: 'Your API keys never enter the browser bundle. Analysis runs server-side with strict security.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload your business data',
    desc: 'Drag & drop CSV, Excel files, or screenshot any dashboard. No manual cleanup needed.',
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI analyzes & visualizes',
    desc: 'Multimodal AI computes metrics, structures trends, and detects hidden anomalies.',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Ask follow-up questions',
    desc: 'Review your visual report and ask follow-up questions to dynamically update charts.',
  },
];

export const Landing: React.FC = () => {
  const { user, switchToDemoMode } = useAuth();
  const navigate = useNavigate();
  const [activeDatasetKey, setActiveDatasetKey] = useState<string>('saas');

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleDemoClick = () => {
    switchToDemoMode();
    navigate('/dashboard');
  };

  const activeDataset = SAMPLE_DATASETS[activeDatasetKey];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden">
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">InsightFlow</span>
              <span className="ml-2 text-[10px] uppercase font-mono tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                AI Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDemoClick}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Live Workspace
            </button>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Multimodal AI Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05] mb-6">
            Transform raw data into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              executive insight
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Drop your spreadsheets or dashboard screenshots. InsightFlow's AI generates KPI summaries, real-time charts, anomaly detection, and lets you ask follow-up questions — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/signup">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Analyzing Free
              </Button>
            </Link>
            <button
              onClick={handleDemoClick}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors px-5 py-2.5"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              Try Live Interactive Demo
            </button>
          </div>

          {/* ── REAL INTERACTIVE PRODUCT SHOWCASE ─────────────────── */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 text-left space-y-6">
              
              {/* Interactive Dataset Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs uppercase font-mono text-slate-400 font-semibold tracking-wider">
                    Interactive Live Preview:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {Object.keys(SAMPLE_DATASETS).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveDatasetKey(key)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeDatasetKey === key
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {SAMPLE_DATASETS[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Confidence */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeDataset.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time interactive chart rendering using live Recharts engine.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {(activeDataset.confidence * 100).toFixed(0)}% AI Confidence
                </span>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeDataset.metrics.map((kpi) => (
                  <div key={kpi.name} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{kpi.name}</div>
                    <div className="text-lg font-extrabold text-white font-mono">{kpi.value}</div>
                    <div className={`text-[11px] font-semibold ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {kpi.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Real Interactive Chart Component */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{activeDataset.chart.title}</span>
                  <span className="font-mono text-[11px] text-indigo-400">Hover graph to inspect values</span>
                </div>
                <ChartRenderer chart={activeDataset.chart} height={240} />
              </div>

              {/* Anomaly Callout */}
              <div className="flex items-center gap-2.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <TrendingUp className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Anomaly Detected:</strong> {activeDataset.anomaly}
                </span>
              </div>

              {/* Direct CTA inside preview card */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                <span className="text-slate-400">Want to run this on your own data?</span>
                <button
                  onClick={handleDemoClick}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 flex items-center gap-1"
                >
                  <span>Open live workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">Process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From raw data to insight in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="glass-card p-6 rounded-2xl space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-400/60 font-bold">{step.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">Capabilities</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to understand your business
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-card p-6 rounded-2xl space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-slate-800/60 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to understand your data?
          </h2>
          <p className="text-slate-400 text-lg">
            Upload your first dataset and get a full AI-generated analytical report with KPIs, charts, anomalies, and insights in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create Free Account
              </Button>
            </Link>
            <button
              onClick={handleDemoClick}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              Try the live demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span>InsightFlow — AI Business Analytics</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
