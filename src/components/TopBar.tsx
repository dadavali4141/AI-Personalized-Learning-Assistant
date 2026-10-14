import React, { useState } from 'react';
import { PageId } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Download,
  LogIn,
  LogOut,
  UserCheck,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenMenu: () => void;
  onOpenAuth: () => void;
  onExportReport: () => void;
}

const pageTitles: Record<PageId, string> = {
  dashboard: 'Dashboard',
  learning: 'My Learning',
  quiz: 'Practice Quiz',
  coach: 'Study Coach',
  tutor: 'AI Tutor',
  analytics: 'Progress & Reports',
  profile: 'My Profile',
};

export const TopBar: React.FC<Props> = ({
  activePage,
  onSelectPage,
  onOpenMenu,
  onOpenAuth,
  onExportReport,
}) => {
  const { user, profile, isGuestDemo, logOut } = useAuth();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const getInitials = (name: string) => {
    return (name || 'S')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase() || 'S';
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0b1120]/90 backdrop-blur-md border-b border-[#1c263a] px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
      {/* Zone 1: Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMenu}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800/60"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs text-slate-400 flex items-center gap-2 whitespace-nowrap">
          <span>Workspace</span>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-slate-100">{pageTitles[activePage]}</span>
        </div>
      </div>

      {/* Zone 2: Navigation Quicklinks for Desktop */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onSelectPage('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activePage === 'dashboard' ? 'text-violet-300' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectPage('learning')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activePage === 'learning' ? 'text-violet-300' : ''
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => onSelectPage('quiz')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activePage === 'quiz' ? 'text-violet-300' : ''
          }`}
        >
          Quizzes
        </button>
        <button
          onClick={() => onSelectPage('tutor')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
            activePage === 'tutor' ? 'text-cyan-300' : ''
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          AI Tutor
        </button>
        <button
          onClick={() => onSelectPage('analytics')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activePage === 'analytics' ? 'text-violet-300' : ''
          }`}
        >
          Analytics
        </button>
      </nav>

      {/* Zone 3: Today Tag, Export CSV, Account Dropdown & Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
        {/* Date pill */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-300 bg-[#121b2e] border border-[#222d44] px-3 py-1.5 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{todayStr}</span>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={onExportReport}
          title="Export complete learning report (CSV)"
          className="p-2 text-slate-300 hover:text-white bg-[#151e32] hover:bg-[#1f2b47] border border-[#26334d] rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown((prev) => !prev)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#151e32] hover:bg-[#1f2b47] border border-[#26334d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <span className="max-w-[100px] md:max-w-[140px] truncate">
              {user ? user.email : isGuestDemo ? 'Guest' : 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Account Dropdown */}
          {showAccountDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowAccountDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-[#11192c] border border-[#29354e] rounded-2xl shadow-2xl p-2.5 z-40 text-xs">
                {user ? (
                  <div className="p-2 mb-2 bg-[#17223b] rounded-xl border border-indigo-900/30">
                    <div className="font-bold text-white truncate">{profile.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Cloud Authenticated</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 mb-2 bg-amber-950/30 rounded-xl border border-amber-900/30">
                    <div className="font-bold text-amber-300">Local / Guest Session</div>
                    <p className="text-[10px] text-amber-200/80 mt-0.5">
                      Sign in with Google or Email to save progress permanently to Cloud Firestore.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onSelectPage('profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-colors"
                >
                  Manage Student Profile
                </button>

                {user ? (
                  <button
                    onClick={async () => {
                      setShowAccountDropdown(false);
                      await logOut();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 font-medium flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAccountDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-cyan-300 hover:bg-cyan-950/40 font-medium flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In or Create Account</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Avatar link to profile */}
        <button
          onClick={() => onSelectPage('profile')}
          title="Go to student profile"
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md hover:scale-105 transition-transform"
        >
          {getInitials(profile.name)}
        </button>
      </div>
    </header>
  );
};
