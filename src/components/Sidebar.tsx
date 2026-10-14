import React from 'react';
import { PageId } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Sparkles,
  BarChart3,
  User,
  Bot,
  Globe2,
  X,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
}

export const Sidebar: React.FC<Props> = ({
  activePage,
  onSelectPage,
  isOpen,
  onClose,
  totalQuestions,
}) => {
  const { user, profile, isGuestDemo } = useAuth();

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'learning', label: 'My Learning', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Practice Quiz', icon: <CheckCircle2 className="w-4 h-4" />, badge: totalQuestions },
    { id: 'coach', label: 'Study Coach', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'analytics', label: 'Progress & Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
  ];

  const getInitials = (name: string) => {
    return (name || 'S')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase() || 'S';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0d1324] border-r border-[#1c263b] p-5 flex flex-col z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-[#1c263b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/20">
              ✦
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                LearnAI
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Personal Learning
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SDG 4 Tag */}
        <div className="px-3 py-2 mb-4 rounded-lg bg-indigo-950/40 border border-indigo-900/40 flex items-center gap-2 text-indigo-300 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">UN SDG 4 · Quality Education</span>
        </div>

        {/* Nav list */}
        <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2">
          Workspace
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onClose();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 text-violet-200 border border-violet-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e32]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-violet-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      isActive
                        ? 'bg-violet-500/30 text-violet-200'
                        : 'bg-[#1e2940] text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Card */}
        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1a2440] to-[#12192c] border border-[#2b3150]">
            <div className="flex items-center gap-1.5 text-violet-300 text-xs font-bold mb-1">
              <span>✧</span> Small steps. Big growth.
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Consistent active recall turns difficult concepts into lasting knowledge.
            </p>
            <button
              onClick={() => {
                onSelectPage('coach');
                onClose();
              }}
              className="w-full text-center py-1.5 px-2 rounded-lg bg-[#202a41] hover:bg-[#283654] text-violet-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Get study plan →
            </button>
          </div>

          {/* User profile row */}
          <div
            onClick={() => {
              onSelectPage('profile');
              onClose();
            }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#151e32] cursor-pointer transition-colors border-t border-[#1c263b] pt-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {getInitials(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{profile.name || 'Student'}</div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                {user ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    Cloud Synced
                  </span>
                ) : isGuestDemo ? (
                  <span className="text-amber-400">Guest Demo</span>
                ) : (
                  <span>Local Student</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
