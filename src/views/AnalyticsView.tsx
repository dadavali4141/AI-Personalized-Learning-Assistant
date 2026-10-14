import React from 'react';
import { useAuth } from '../context/AuthContext';
import { subjects } from '../data/learningData';
import { CanvasScoreChart } from '../components/CanvasScoreChart';
import {
  Download,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Clock,
  HelpCircle,
  BarChart2,
  Layers,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
  onExportReport: () => void;
}

export const AnalyticsView: React.FC<Props> = ({ onShowToast, onExportReport }) => {
  const { profile, quizzes, sessions, clearHistoryData } = useAuth();

  const totalQuizzes = quizzes.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
      : null;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);
  const totalQuestions = quizzes.reduce((acc, q) => acc + q.total, 0);

  // Subject performance stats
  const subjectBreakdown = subjects
    .map((s) => {
      const attempts = quizzes.filter((q) => q.subject === s.id);
      const avg =
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, q) => sum + q.score, 0) / attempts.length)
          : null;
      return {
        ...s,
        attempts: attempts.length,
        avg,
      };
    })
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  const handleClear = async () => {
    if (totalQuizzes === 0) {
      onShowToast('There are no saved quiz attempts to clear.');
      return;
    }
    if (confirm('Clear all saved quiz attempt records? Your profile and logged study sessions will remain safe.')) {
      await clearHistoryData();
      onShowToast('Quiz history cleared.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            — Your Growth, Made Visible
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Progress & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review detailed historical performance, track domain mastery, and export verified academic reports.
          </p>
        </div>

        <button
          onClick={onExportReport}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-300" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes Taken</span>
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {totalQuizzes}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Saved attempts</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Score</span>
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all subjects</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Study Time</span>
            <div className="w-7 h-7 rounded-lg bg-teal-600/20 text-teal-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {totalMinutes} <small className="text-xs font-semibold text-slate-400">min</small>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Logged sessions</div>
        </article>

        <article className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#101728] border border-[#222d43] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Questions Answered</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-300 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
            {totalQuestions}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total questions evaluated</div>
        </article>
      </div>

      {/* Two Column Layout: Score Trend & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Score Trend Chart */}
        <article className="lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span>Score Trajectory Over Time</span>
                </h3>
                <p className="text-xs text-slate-400">Recent quiz attempts (up to 12 newest)</p>
              </div>
            </div>
          </div>

          <div className="my-4">
            <CanvasScoreChart data={quizzes} maxItems={12} height={220} />
          </div>
        </article>

        {/* Subject Breakdown Bars */}
        <article className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Subject Performance Overview</span>
            </h3>
            <p className="text-xs text-slate-400">Average score by curriculum domain</p>
          </div>

          <div className="space-y-4">
            {subjectBreakdown.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{s.name}</span>
                  <span className="font-bold text-white tabular-nums">
                    {s.avg !== null ? `${s.avg}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1e2942] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${s.avg || 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  {s.attempts > 0 ? `${s.attempts} attempts` : 'No attempts'}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Quiz History Table */}
      <article className="p-6 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Quiz History Log</span>
            </h3>
            <p className="text-xs text-slate-400">All saved completed quiz attempts, newest first</p>
          </div>

          {totalQuizzes > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#202c46] text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Ratio</th>
                <th className="py-3 px-3">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b253d]">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No quiz history recorded yet. Complete a quiz to start building your record.
                  </td>
                </tr>
              ) : (
                quizzes.map((q, i) => (
                  <tr key={q.id || i} className="hover:bg-[#151f34] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{q.subject}</td>
                    <td className="py-3 px-3 text-slate-400 tabular-nums">
                      {q.day || (q.at ? q.at.split('T')[0] : '—')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold tabular-nums text-[11px] ${
                          q.score >= 80
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : q.score >= 60
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        }`}
                      >
                        {q.score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">
                      {q.correct}/{q.total}
                    </td>
                    <td className="py-3 px-3 text-slate-400 capitalize">
                      {q.difficulty === 'all' ? 'Mixed' : q.difficulty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
};
