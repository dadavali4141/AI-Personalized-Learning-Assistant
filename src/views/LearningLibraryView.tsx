import React, { useState } from 'react';
import { subjects } from '../data/learningData';
import { Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface Props {
  onStartQuiz: (subjectId: string) => void;
  onOpenNotes: (subject: Subject) => void;
  onAskAI: (subject: Subject) => void;
  onShowToast: (msg: string) => void;
}

export const LearningLibraryView: React.FC<Props> = ({
  onStartQuiz,
  onOpenNotes,
  onAskAI,
  onShowToast,
}) => {
  const { saveStudySessionData } = useAuth();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Study log form state
  const [logSubject, setLogSubject] = useState(subjects[0].name);
  const [logMinutes, setLogMinutes] = useState(25);
  const [logNote, setLogNote] = useState('');
  const [logging, setLogging] = useState(false);

  const filtered = subjects.filter((s) => {
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.topics.some((t) => t.toLowerCase().includes(q));
    return matchesLevel && matchesSearch;
  });

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logMinutes <= 0) return;
    setLogging(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await saveStudySessionData({
        subject: logSubject,
        minutes: Number(logMinutes),
        note: logNote.trim(),
        at: new Date().toISOString(),
        day: today,
      });
      setLogNote('');
      onShowToast(`Saved ${logMinutes} study minutes for ${logSubject}!`);
    } catch (err: any) {
      console.error('Error logging session:', err);
      onShowToast('Could not save session. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            — Your Study Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Learning Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured computer science and programming domains designed for conceptual mastery and active recall.
          </p>
        </div>

        <button
          onClick={() => onStartQuiz(subjects[0].id)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Quick Practice Quiz →</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search subjects, topics (e.g. loops, SQL, OSI, trees)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11192c] border border-[#26324b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full sm:w-44 py-2.5 px-3 rounded-xl bg-[#11192c] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs rounded-2xl bg-[#11192c] border border-dashed border-[#222d43]">
            No subjects matched your search criteria. Try a different keyword or clear the filter.
          </div>
        ) : (
          filtered.map((sub) => (
            <article
              key={sub.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#131b2e] to-[#0f1729] border border-[#222d44] hover:border-violet-500/50 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c2742] text-violet-300 flex items-center justify-center font-bold text-lg">
                    {sub.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1d273f] text-slate-300 border border-[#2b3856]">
                    {sub.level}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-violet-200 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {sub.desc}
                </p>

                {/* Topics pill tags */}
                <div className="flex flex-wrap gap-1.5 my-3.5">
                  {sub.topics.slice(0, 4).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#192338] text-slate-300 border border-[#24334f]"
                    >
                      {t}
                    </span>
                  ))}
                  {sub.topics.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                      +{sub.topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3.5 border-t border-[#1c263c] flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{sub.minutes} min sprint</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenNotes(sub)}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-[#18233a] hover:bg-[#202f4d] border border-[#263554] transition-colors"
                    title="Read notes & worked examples"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onAskAI(sub)}
                    className="p-1.5 text-cyan-300 hover:text-white rounded-lg bg-[#18233a] hover:bg-cyan-950/50 border border-cyan-800/30 transition-colors"
                    title="Ask AI Tutor"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => onStartQuiz(sub.id)}
                    className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Quiz</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Log a Study Session Panel */}
      <article className="p-6 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d44] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-300 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Log a Study Session</h3>
            <p className="text-xs text-slate-400">
              Record focused offline reading, lecture time, or problem-solving to maintain your streak.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSession} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <label className="sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-slate-300">
            <span>Subject</span>
            <select
              value={logSubject}
              onChange={(e) => setLogSubject(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-[#0c1322] border border-[#26324b] text-white text-xs focus:outline-none focus:border-teal-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-semibold text-slate-300">
            <span>Minutes Studied</span>
            <input
              type="number"
              min={1}
              max={600}
              required
              value={logMinutes}
              onChange={(e) => setLogMinutes(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="py-2.5 px-3 rounded-xl bg-[#0c1322] border border-[#26324b] text-white text-xs focus:outline-none focus:border-teal-500 tabular-nums"
            />
          </label>

          <label className="sm:col-span-5 flex flex-col gap-1 text-xs font-semibold text-slate-300">
            <span>What did you work on? (Reflection note)</span>
            <input
              type="text"
              placeholder="e.g. Practiced binary search trees and recursion edge cases"
              maxLength={150}
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-[#0c1322] border border-[#26324b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </label>

          <button
            type="submit"
            disabled={logging}
            className="sm:col-span-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{logging ? 'Saving...' : 'Save Session'}</span>
          </button>
        </form>
      </article>
    </div>
  );
};
