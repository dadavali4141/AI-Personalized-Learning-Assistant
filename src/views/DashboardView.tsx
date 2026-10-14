import React from 'react';
import { useAuth } from '../context/AuthContext';
import { subjects } from '../data/learningData';
import { PageId } from '../types';
import { CanvasScoreChart } from '../components/CanvasScoreChart';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Award,
  Globe2,
} from 'lucide-react';

interface Props {
  onNavigate: (page: PageId, extra?: any) => void;
  onStartQuiz: (subjectId?: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate, onStartQuiz }) => {
  const { profile, quizzes, sessions, activity } = useAuth();

  // Statistics calculation from saved data
  const totalQuizzes = quizzes.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
      : null;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);

  // Consistent streak calculation based on user local date
  const computeStreak = () => {
    const activityDates = new Set<string>([
      ...quizzes.map((q) => q.day),
      ...sessions.map((s) => s.day),
    ]);

    let streak = 0;
    const current = new Date();

    // Format YYYY-MM-DD
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // If active today, count it; if not active today but active yesterday, streak is still alive
    const todayStr = formatDate(current);
    const yesterday = new Date(current);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    let checkDate = activityDates.has(todayStr) ? current : activityDates.has(yesterdayStr) ? yesterday : null;

    if (!checkDate) return 0;

    const walker = new Date(checkDate);
    while (activityDates.has(formatDate(walker))) {
      streak++;
      walker.setDate(walker.getDate() - 1);
    }

    return streak;
  };

  const streakDays = computeStreak();

  // Subject statistics for continue-learning preview
  const subjectStats: Record<string, { attempts: number; sumScore: number }> = {};
  subjects.forEach((s) => {
    subjectStats[s.id] = { attempts: 0, sumScore: 0 };
  });
  quizzes.forEach((q) => {
    if (!subjectStats[q.subject]) {
      subjectStats[q.subject] = { attempts: 0, sumScore: 0 };
    }
    subjectStats[q.subject].attempts++;
    subjectStats[q.subject].sumScore += q.score;
  });

  // Dynamic recommendations
  const generateRecommendations = () => {
    const list: { title: string; desc: string; icon: string; subjectId: string }[] = [];

    // 1. Weakest subject if <80%
    const attempted = subjects
      .filter((s) => subjectStats[s.id]?.attempts > 0)
      .map((s) => ({
        ...s,
        avg: Math.round(subjectStats[s.id].sumScore / subjectStats[s.id].attempts),
      }))
      .sort((a, b) => a.avg - b.avg);

    if (attempted.length > 0 && attempted[0].avg < 80) {
      list.push({
        title: `Review ${attempted[0].name}`,
        desc: `Your current average is ${attempted[0].avg}%. Revisit fundamental concepts and take a refresher quiz.`,
        icon: '◎',
        subjectId: attempted[0].id,
      });
    }

    // 2. Unattempted subject
    const unattempted = subjects.filter((s) => (subjectStats[s.id]?.attempts || 0) === 0);
    if (unattempted.length > 0) {
      const target = unattempted.find((s) => s.id === profile.focus) || unattempted[0];
      list.push({
        title: `Explore ${target.name}`,
        desc: `No saved quiz attempts yet. Complete a 5-question baseline quiz to evaluate your current knowledge.`,
        icon: '✦',
        subjectId: target.id,
      });
    }

    // 3. Focus sprint
    const focusSub = subjects.find((s) => s.id === profile.focus) || subjects[0];
    list.push({
      title: `Focused ${focusSub.short} Study Sprint`,
      desc: `Dedicate a focused ${profile.duration || 25}-minute session to ${focusSub.topics[0]} with the Study Coach.`,
      icon: '◷',
      subjectId: focusSub.id,
    });

    return list.slice(0, 3);
  };

  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            — Your Personal Learning Space
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Keep growing, <span className="text-violet-300">{profile.name.split(/\s+/)[0] || 'Student'}</span> ✦
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            A little structured practice each day adds up to remarkable mastery and retention.
          </p>
        </div>

        <button
          onClick={() => onStartQuiz()}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>＋ Start Practice Quiz</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#373460] bg-gradient-to-br from-[#1e1b43] via-[#161a38] to-[#0f2438] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>UN SDG 4 · Quality Education</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Learn smarter.<br />
            <span className="text-violet-300">Not just harder.</span>
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md">
            Diagnose your knowledge gaps, practice targeted questions with instant feedback, and let our adaptive study coach guide your revision.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('coach')}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Build My Study Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('tutor')}
              className="px-4 py-2 rounded-xl bg-[#222e4d] hover:bg-[#2b3a62] text-cyan-300 border border-cyan-800/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Decorative Geometric Elements */}
        <div className="hidden lg:block absolute -right-6 -bottom-6 w-72 h-72 rounded-full border border-violet-500/20 bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 pointer-events-none" />
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes Completed</span>
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {totalQuizzes}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Practice makes progress</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Quiz Score</span>
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across completed attempts</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Minutes</span>
            <div className="w-7 h-7 rounded-lg bg-teal-600/20 text-teal-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {totalMinutes}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Logged focused study time</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Learning Streak</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-300 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {streakDays} <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Consistency drives retention</div>
        </article>
      </div>

      {/* Two Column Layout: Score Trend & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Score Trend Chart */}
        <article className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#0f1728] border border-[#222d43] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Quiz Performance</h3>
                <p className="text-[11px] text-slate-400">Score trajectory over recent attempts</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <span>Full report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <span>Quiz score (%)</span>
              </span>
              <span>·</span>
              <span>Last 7 attempts</span>
            </div>
          </div>

          <div className="my-2">
            <CanvasScoreChart data={quizzes} maxItems={7} height={180} />
          </div>
        </article>

        {/* Recommendations */}
        <article className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#0f1728] border border-[#222d43] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Recommended Next Steps</h3>
                <p className="text-[11px] text-slate-400">Personalized from your diagnostic scores</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#151e32] border border-[#222e45] flex items-start justify-between gap-3 hover:border-violet-500/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-900/30 text-violet-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    {rec.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{rec.title}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{rec.desc}</p>
                  </div>
                  <button
                    onClick={() => onStartQuiz(rec.subjectId)}
                    title={`Start practice in ${rec.subjectId}`}
                    className="p-1.5 text-violet-400 hover:text-white rounded-lg hover:bg-violet-600/20 transition-colors shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('coach')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-[#172138] hover:bg-[#202d4b] border border-[#273552] text-violet-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Study Coach & Weekly Target</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </article>
      </div>

      {/* Two Column Layout: Continue Learning & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Continue Learning */}
        <article className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#0f1728] border border-[#222d43] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Curriculum Progress</h3>
              <p className="text-[11px] text-slate-400">Pick up where you left off across subjects</p>
            </div>
            <button
              onClick={() => onNavigate('learning')}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              All 6 subjects →
            </button>
          </div>

          <div className="space-y-3">
            {subjects.slice(0, 4).map((sub) => {
              const stats = subjectStats[sub.id] || { attempts: 0, sumScore: 0 };
              const percent = stats.attempts > 0 ? Math.round(stats.sumScore / stats.attempts) : 0;
              return (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-[#151e32] border border-[#222e45] flex items-center justify-between gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1b2640] text-violet-300 flex items-center justify-center font-bold text-base shrink-0">
                    {sub.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white truncate">{sub.name}</span>
                      <span className="text-slate-400 tabular-nums">
                        {stats.attempts > 0 ? `${percent}%` : 'Ready'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#202b42] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {stats.attempts > 0
                        ? `${stats.attempts} quiz ${stats.attempts === 1 ? 'attempt' : 'attempts'}`
                        : 'No quizzes completed yet'}
                    </div>
                  </div>
                  <button
                    onClick={() => onStartQuiz(sub.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#202c46] hover:bg-violet-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    Practice →
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        {/* Recent Activity */}
        <article className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#0f1728] border border-[#222d43] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                <p className="text-[11px] text-slate-400">Your latest logged actions and quiz results</p>
              </div>
            </div>

            <div className="space-y-3">
              {activity.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Your activity stream will appear as you take quizzes and record study time.
                </div>
              ) : (
                activity.slice(0, 5).map((act, i) => (
                  <div key={act.id || i} className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-[#1a243d] text-violet-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      {act.icon || '✦'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{act.title}</div>
                      <p className="text-[11px] text-slate-400 truncate">{act.detail}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">
                      {new Date(act.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
