import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

// ── Plan Configuration ──────────────────────────────────────────────────────
// This configuration is isolated and can be replaced with real billing data later.
const PLAN_CONFIG = {
  name: 'Free Plan',
  analysisLimit: 10, // Replace with real tier limit from billing service
};

interface ProfileMenuProps {
  reportCount: number; // Actual count from real stored reports — never hardcoded
  onOpenSettings?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ reportCount, onOpenSettings }) => {
  const { user, signOut, isDemoMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';
  const userEmail = user?.email ?? '';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase() ?? '')
    .join('');

  // Truthful usage data from actual report count
  const usedCount = Math.min(reportCount, PLAN_CONFIG.analysisLimit);
  const usagePercent = Math.round((usedCount / PLAN_CONFIG.analysisLimit) * 100);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-800/60 transition-colors group"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-indigo-500/30 shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
          ) : (
            initials || <UserIcon className="w-4 h-4" />
          )}
        </div>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 z-50 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/40 overflow-hidden">

          {/* User info header */}
          <div className="px-4 py-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden border border-indigo-500/30 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  initials || <UserIcon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
            {isDemoMode && (
              <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo Mode
              </span>
            )}
          </div>

          {/* Plan & Usage */}
          <div className="px-4 py-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">{PLAN_CONFIG.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {usedCount} / {PLAN_CONFIG.analysisLimit} analyses used
              </span>
            </div>

            {/* Progress bar — uses real usedCount from actual reports */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  usagePercent >= 90
                    ? 'bg-rose-500'
                    : usagePercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                )}
                style={{ width: `${usagePercent}%` }}
                role="progressbar"
                aria-valuenow={usedCount}
                aria-valuemin={0}
                aria-valuemax={PLAN_CONFIG.analysisLimit}
              />
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => { onOpenSettings?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed opacity-50"
              title="Billing coming soon"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade Plan
              <span className="ml-auto text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                Soon
              </span>
            </button>
          </div>

          {/* Sign out */}
          <div className="px-4 py-3 border-t border-slate-800/80">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
