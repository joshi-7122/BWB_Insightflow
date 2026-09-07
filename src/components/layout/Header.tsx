import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { AnalysisService } from '@/services/analysis.service';
import { Report } from '@/types';
import { Sparkles, Plus, BarChart3, Search, FileText, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const location = useLocation();
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('insightflow_theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('insightflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  useEffect(() => {
    if (user?.id) {
      AnalysisService.getReports(user.id).then(setReports).catch(() => {});
    }
  }, [user?.id]);

  const openPalette = useCallback(() => setIsCmdPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsCmdPaletteOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
              <span className="font-bold text-[15px] tracking-tight hidden sm:block">
                InsightFlow
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isDemoMode && (
              <Badge variant="warning" className="hidden sm:inline-flex">
                Demo Mode
              </Badge>
            )}

            {/* Theme Toggle (Stitch Luminous Clarity Light vs Dark) */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Luminous Light (Stitch)' : 'Graphite Dark'} theme`}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all duration-150"
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Search / ⌘K trigger */}
            <button
              onClick={openPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-colors duration-150 shadow-inner group"
              aria-label="Open command palette"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
              <span>Search…</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* New Analysis */}
            <Link to="/upload" className="hidden sm:block">
              <Button size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Analysis
              </Button>
            </Link>

            {/* Profile Menu */}
            {user && (
              <ProfileMenu
                reportCount={reports.length}
                onOpenSettings={() =>
                  window.dispatchEvent(new CustomEvent('insightflow:open-settings'))
                }
              />
            )}
          </div>
        </div>
      </header>

      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={closePalette}
        reports={reports}
      />
    </>
  );
};
