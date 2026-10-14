import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subjects } from '../data/learningData';
import { recordAIConversation, fetchAIConversations } from '../services/firebase';
import { AIConversation } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface Props {
  initialSubject?: string;
  initialQuestion?: string;
}

export const AITutorView: React.FC<Props> = ({ initialSubject, initialQuestion }) => {
  const { user, profile } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'Python Programming');
  const [studentLevel, setStudentLevel] = useState<'Beginner' | 'College / Undergraduate' | 'Advanced'>('College / Undergraduate');
  const [inputQuery, setInputQuery] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AIConversation[]>([]);
  const [aiStatus, setAiStatus] = useState<{ enabled: boolean; message: string }>({
    enabled: true,
    message: '',
  });

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAiStatus({
          enabled: !!data.aiEnabled,
          message: data.aiEnabled
            ? 'Connected to Google Gemini AI Tutor'
            : 'Gemini API key is not configured in environment secrets. Rule-based curriculum answers available.',
        });
      })
      .catch(() => {
        setAiStatus({
          enabled: false,
          message: 'Server connectivity offline. Checking fallback responses.',
        });
      });

    if (user) {
      fetchAIConversations(user.uid)
        .then((items) => setHistory(items))
        .catch((e) => console.warn('Could not load AI history:', e));
    }
  }, [user]);

  // If initialQuestion provided, auto-trigger
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      setInputQuery(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSend = async (questionText?: string) => {
    const queryToSend = questionText || inputQuery;
    if (!queryToSend.trim() || loading) return;

    setLoading(true);
    setInputQuery('');

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryToSend,
          subject: selectedSubject,
          studentLevel,
          context: {
            studentName: profile.name,
            goal: profile.goal,
            focus: profile.focus,
            confidence: profile.confidence,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer from AI Tutor');
      }

      const answerText = data.text;
      const newConv: AIConversation = {
        subject: selectedSubject,
        question: queryToSend,
        answer: answerText,
        at: new Date().toISOString(),
      };

      setHistory((prev) => [newConv, ...prev]);

      if (user) {
        await recordAIConversation(user.uid, newConv);
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      // Fallback response with explicit attribution
      const fallbackConv: AIConversation = {
        subject: selectedSubject,
        question: queryToSend,
        answer: `[Note: AI Service unavailable. Fallback Educational Guide]\n\nRegarding "${queryToSend}":\nFor ${selectedSubject}, core concepts emphasize strong understanding of fundamental abstractions, memory management, and algorithmic complexity. Revisit the learning library curriculum and review the practice quizzes for worked examples.`,
        at: new Date().toISOString(),
      };
      setHistory((prev) => [fallbackConv, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    `Explain how recursion uses the call stack in simple terms with an example.`,
    `What is the difference between TCP and UDP, and when should I use each?`,
    `Why is 3NF normalization important in relational databases?`,
    `Explain the difference between a process and a thread in an Operating System.`,
    `How does binary search achieve O(log n) time complexity?`,
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Interactive AI Mentor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-cyan-400" />
            <span>LearnAI Tutor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ask any question, request step-by-step breakdowns, worked code examples, or exam revision guidance.
          </p>
        </div>

        {/* AI Connection status banner */}
        <div
          className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
            aiStatus.enabled
              ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
              : 'bg-amber-950/40 border border-amber-800/40 text-amber-300'
          }`}
        >
          {aiStatus.enabled ? (
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-[11px] font-medium">{aiStatus.message}</span>
        </div>
      </div>

      {/* Control bar: Subject + Level */}
      <div className="p-4 rounded-2xl bg-[#11192c] border border-[#222d43] flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span>Subject Focus:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#0c1222] border border-[#26324b] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="General Computer Science">General Computer Science</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Explanation Level:</span>
          <select
            value={studentLevel}
            onChange={(e) => setStudentLevel(e.target.value as any)}
            className="bg-[#0c1222] border border-[#26324b] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="Beginner">Beginner (Simple Analogies & Core Intuition)</option>
            <option value="College / Undergraduate">College / Undergraduate (Technical & Rigorous)</option>
            <option value="Advanced">Advanced (Systems Architecture & Optimization)</option>
          </select>
        </label>
      </div>

      {/* Input box */}
      <div className="p-4 rounded-2xl bg-[#121a2d] border border-[#222d43] shadow-lg">
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span>Ask a concept, homework question, or code doubt</span>
          </span>
          <span className="text-[10px] text-slate-500">Press Enter or click Send</span>
        </div>

        <div className="flex gap-2">
          <textarea
            rows={3}
            placeholder={`e.g. Can you explain the difference between method overloading and overriding in Java with an example?`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-[#0a0f1d] border border-[#26334f] rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="self-end px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Thinking...</span>
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Suggested prompts */}
        <div className="mt-3.5 pt-3 border-t border-[#1e293f]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
            Suggested Prompts to Explore:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-[#18233a] hover:bg-[#202f4d] text-slate-300 hover:text-white border border-[#273654] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Tutor Explanation History</span>
          <span className="text-[10px] text-slate-500 font-normal">
            {history.length} {history.length === 1 ? 'interaction' : 'interactions'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#11192c] border border-dashed border-[#222d43] text-center text-slate-500 space-y-2">
            <Bot className="w-10 h-10 mx-auto text-slate-600 mb-1" />
            <div className="text-xs font-bold text-slate-400">No AI conversations yet</div>
            <p className="text-xs max-w-sm mx-auto">
              Type your first question above or select one of the suggested prompts to get a tailored explanation.
            </p>
          </div>
        ) : (
          history.map((conv, idx) => (
            <article
              key={conv.id || idx}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#121a2d] to-[#0f1627] border border-[#222d43] shadow-md space-y-3"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                    Q
                  </div>
                  <h3 className="font-bold text-sm text-white">{conv.question}</h3>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(conv.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Answer content */}
              <div className="p-4 rounded-xl bg-[#0b101e] border border-[#1d273d] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {conv.answer}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span className="text-cyan-400">Subject: {conv.subject}</span>
                <span>Powered by Gemini 3.8 Flash</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
