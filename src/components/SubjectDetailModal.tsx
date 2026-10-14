import React from 'react';
import { Subject } from '../types';
import { X, CheckCircle2, Code2, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  subject: Subject | null;
  onClose: () => void;
  onStartQuiz: (subjectId: string) => void;
  onAskAI: (subject: Subject) => void;
}

export const SubjectDetailModal: React.FC<Props> = ({
  subject,
  onClose,
  onStartQuiz,
  onAskAI,
}) => {
  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#11192c] border border-[#2b3752] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/20 shrink-0">
            {subject.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40">
                {subject.level} Level
              </span>
              <span className="text-xs text-slate-400">· {subject.minutes} min sprint</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {subject.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{subject.desc}</p>
          </div>
        </div>

        {/* Topics covered */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Key Topics & Core Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {subject.topics.map((t, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-lg bg-[#18233b] border border-[#273654] text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Learning Objectives</span>
          </h3>
          <div className="space-y-2">
            {subject.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conceptual Summary */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0d1425] border border-[#232f48]">
          <h3 className="text-xs font-bold text-violet-300 mb-2">Core Theory & Fundamentals</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{subject.keyConcept}</p>
        </div>

        {/* Worked Code / Flow Example */}
        {subject.codeSnippet && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-violet-400" />
              <span>Worked Example & Code Structure</span>
            </h3>
            <pre className="p-4 rounded-2xl bg-[#090d18] border border-[#1e2840] text-violet-200 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <code>{subject.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#1c263b]">
          <button
            onClick={() => {
              onClose();
              onAskAI(subject);
            }}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#18243c] hover:bg-[#223356] text-cyan-300 border border-cyan-800/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ask AI Tutor About {subject.short}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onStartQuiz(subject.id);
            }}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-600/25 cursor-pointer"
          >
            <span>Start Practice Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
