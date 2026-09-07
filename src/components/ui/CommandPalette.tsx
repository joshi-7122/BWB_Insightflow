import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report } from '@/types';
import { detectSourceFileType } from '@/lib/formatters';
import { Search, Plus, BarChart3, FileText, Settings, Upload, X } from 'lucide-react';
import { clsx } from 'clsx';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  group: 'reports' | 'actions' | 'navigation';
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  reports,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 80);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build flat list of all commands
  const buildCommands = useCallback((): CommandItem[] => {
    const reportItems: CommandItem[] = reports.slice(0, 20).map((r) => {
      const fileNames = r.report_json?.metadata?.fileNames;
      const { label: typeBadge, color: badgeColor } = detectSourceFileType(fileNames);
      return {
        id: `report-${r.id}`,
        label: r.title,
        description: r.summary?.slice(0, 80),
        group: 'reports',
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        action: () => { navigate(`/report/${r.id}`); onClose(); },
        badge: typeBadge,
        badgeColor,
      };
    });

    const actionItems: CommandItem[] = [
      {
        id: 'action-new-analysis',
        label: 'New Analysis',
        description: 'Upload a file and generate insights',
        group: 'actions',
        icon: <Plus className="w-4 h-4 text-indigo-400" />,
        action: () => { navigate('/upload'); onClose(); },
      },
      {
        id: 'action-upload',
        label: 'Upload File',
        description: 'Add datasets or images',
        group: 'actions',
        icon: <Upload className="w-4 h-4 text-indigo-400" />,
        action: () => { navigate('/upload'); onClose(); },
      },
    ];

    const navItems: CommandItem[] = [
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Go to main dashboard',
        group: 'navigation',
        icon: <BarChart3 className="w-4 h-4 text-slate-400" />,
        action: () => { navigate('/dashboard'); onClose(); },
      },
      {
        id: 'nav-reports',
        label: 'All Reports',
        description: 'View all historical analyses',
        group: 'navigation',
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        action: () => { navigate('/reports'); onClose(); },
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        description: 'Configure API key and Supabase credentials',
        group: 'navigation',
        icon: <Settings className="w-4 h-4 text-slate-400" />,
        action: () => {
          // Dispatch a custom settings event
          window.dispatchEvent(new CustomEvent('insightflow:open-settings'));
          onClose();
        },
      },
    ];

    return [...reportItems, ...actionItems, ...navItems];
  }, [reports, navigate, onClose]);

  const allCommands = buildCommands();

  const filtered = debouncedQuery.trim() === ''
    ? allCommands
    : allCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );

  // Group the filtered results
  const groups: { label: string; key: string; items: CommandItem[] }[] = [
    { label: 'Reports', key: 'reports', items: filtered.filter((c) => c.group === 'reports') },
    { label: 'Actions', key: 'actions', items: filtered.filter((c) => c.group === 'actions') },
    { label: 'Navigation', key: 'navigation', items: filtered.filter((c) => c.group === 'navigation') },
  ].filter((g) => g.items.length > 0);

  const flatFiltered = groups.flatMap((g) => g.items);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(flatFiltered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + Math.max(flatFiltered.length, 1)) % Math.max(flatFiltered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatFiltered[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Reset selected index when query changes
  useEffect(() => setSelectedIndex(0), [debouncedQuery]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette container */}
      <div className="relative w-full max-w-xl glass-panel palette-animate rounded-2xl shadow-2xl shadow-black/50 border border-slate-700/60 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search reports, actions, navigation…"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            aria-label="Command search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2" role="listbox">
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results for "{debouncedQuery}"
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </span>
                </div>
                {group.items.map((cmd) => {
                  const isSelected = flatIndex++ === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(flatFiltered.indexOf(cmd))}
                      onClick={cmd.action}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100',
                        isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/50'
                      )}
                    >
                      <span className="shrink-0">{cmd.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-100 block truncate">
                          {cmd.label}
                        </span>
                        {cmd.description && (
                          <span className="text-[11px] text-slate-500 block truncate">
                            {cmd.description}
                          </span>
                        )}
                      </span>
                      {cmd.badge && (
                        <span
                          className={clsx(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                            cmd.badgeColor
                          )}
                        >
                          {cmd.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-800/60 flex items-center gap-4 text-[10px] text-slate-600">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> dismiss</span>
        </div>
      </div>
    </div>
  );
};
