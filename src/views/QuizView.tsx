import React, { useState, useEffect } from 'react';
import { subjects, questionBank } from '../data/learningData';
import { QuizQuestion, QuizAnswer, PageId } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  LogOut,
  HelpCircle,
  Award,
  BookOpen,
} from 'lucide-react';

interface Props {
  initialSubject?: string;
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;
  onAskAIExplanation?: (question: string, context: any) => void;
}

export const QuizView: React.FC<Props> = ({
  initialSubject,
  onNavigate,
  onShowToast,
  onAskAIExplanation,
}) => {
  const { saveQuizAttemptData } = useAuth();

  // Setup state
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || subjects[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Quiz execution state
  const [quizState, setQuizState] = useState<'setup' | 'live' | 'result'>('setup');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<QuizAnswer[]>([]);
  const [finalScore, setFinalScore] = useState<{ score: number; correct: number; total: number } | null>(null);

  // AI explanation state for current question
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Shuffle utility
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let pool = questionBank.filter(
      (q) => q.s === selectedSubject && (selectedDifficulty === 'all' || q.d === selectedDifficulty)
    );

    // If pool is smaller than requested count, fallback to all difficulties of this subject
    if (pool.length < questionCount && selectedDifficulty !== 'all') {
      pool = questionBank.filter((q) => q.s === selectedSubject);
    }

    if (pool.length === 0) {
      pool = questionBank;
    }

    const shuffled = shuffle(pool).slice(0, Math.min(questionCount, pool.length));
    setActiveQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswerIndex(null);
    setIsChecked(false);
    setRecordedAnswers([]);
    setFinalScore(null);
    setAiExplanation(null);
    setQuizState('live');
  };

  const handleCheckAnswer = () => {
    if (selectedAnswerIndex === null || isChecked) return;

    const currentQ = activeQuestions[currentIndex];
    const isOk = selectedAnswerIndex === currentQ.a;

    setIsChecked(true);
    setRecordedAnswers((prev) => [
      ...prev,
      {
        ok: isOk,
        topic: currentQ.topic,
        question: currentQ.q,
        selected: selectedAnswerIndex,
        correct: currentQ.a,
      },
    ]);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsChecked(false);
      setAiExplanation(null);
    } else {
      // Calculate final score
      const correctCount = recordedAnswers.filter((a) => a.ok).length;
      const totalCount = activeQuestions.length;
      const scorePct = Math.round((correctCount / totalCount) * 100);

      setFinalScore({
        score: scorePct,
        correct: correctCount,
        total: totalCount,
      });

      // Save to Firestore
      const today = new Date().toISOString().split('T')[0];
      try {
        await saveQuizAttemptData({
          subject: selectedSubject,
          difficulty: selectedDifficulty,
          score: scorePct,
          correct: correctCount,
          total: totalCount,
          answers: recordedAnswers,
          at: new Date().toISOString(),
          day: today,
        });
        onShowToast(`Quiz saved! You scored ${scorePct}%.`);
      } catch (err) {
        console.error('Error saving quiz attempt:', err);
      }

      // Confetti celebration if 80%+
      if (scorePct >= 80) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }

      setQuizState('result');
    }
  };

  const handleAskAITutorForQuestion = async () => {
    const currentQ = activeQuestions[currentIndex];
    if (loadingAi) return;
    setLoadingAi(true);

    try {
      const res = await fetch('/api/tutor/quiz-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentQ.s,
          question: currentQ.q,
          options: currentQ.o,
          selectedAnswer: selectedAnswerIndex !== null ? currentQ.o[selectedAnswerIndex] : 'None',
          correctAnswer: currentQ.o[currentQ.a],
          explanation: currentQ.e,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to explain');
      setAiExplanation(data.text);
    } catch (err: any) {
      console.warn('AI explanation failed:', err);
      setAiExplanation(
        `AI Explanation: The correct answer is "${currentQ.o[currentQ.a]}". Remember: ${currentQ.e}`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExitQuiz = () => {
    if (confirm('Exit this quiz? Incomplete progress will not be recorded as a completed attempt.')) {
      setQuizState('setup');
      setSelectedAnswerIndex(null);
      setIsChecked(false);
      onShowToast('Quiz exited.');
    }
  };

  const currentQ = activeQuestions[currentIndex];
  const progressPercent =
    activeQuestions.length > 0 ? ((currentIndex + (isChecked ? 1 : 0)) / activeQuestions.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* ---------------- SETUP MODE ---------------- */}
      {quizState === 'setup' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11192c] border border-[#222d43] shadow-xl text-slate-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/20 mb-3">
              ✦
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              — Check Your Knowledge
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Practice Quiz
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Answer curated multiple-choice questions, verify immediate feedback with explanations, and save results to your personal record.
            </p>
          </div>

          <form onSubmit={handleStartQuiz} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
              <span>Choose Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.topics.length} topics)
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
              <span>Difficulty Level:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="all">Mixed Difficulty (Comprehensive)</option>
                <option value="Beginner">Beginner Only</option>
                <option value="Intermediate">Intermediate Only</option>
                <option value="Advanced">Advanced Only</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
              <span>Number of Questions:</span>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value={5}>5 Questions · Quick Diagnostic Sprint</option>
                <option value={10}>10 Questions · Standard Focus Session</option>
                <option value={15}>15 Questions · Challenge Assessment</option>
                <option value={39}>All Available Questions</option>
              </select>
            </label>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              <span>Start Quiz Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Learning Tip Box */}
          <div className="mt-6 p-4 rounded-2xl bg-[#0c1426] border border-[#1f2c46] flex items-start gap-3 text-xs text-slate-400">
            <span className="text-violet-400 text-base">✧</span>
            <div>
              <b className="text-slate-200 block mb-0.5">Active Recall Tip</b>
              Attempt each question without referring to notes first. Reviewing the answer explanation right after selection solidifies memory neural pathways.
            </div>
          </div>
        </div>
      )}

      {/* ---------------- LIVE QUIZ MODE ---------------- */}
      {quizState === 'live' && currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11192c] border border-[#222d43] shadow-xl text-slate-100 space-y-5">
          {/* Top meta & progress */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-violet-300 uppercase tracking-wider">
              {currentQ.s}
            </span>
            <span className="font-mono tabular-nums">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[#1e2942] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question sub-header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>QUESTION {String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#19243c] text-cyan-300 border border-[#263756]">
              {currentQ.d}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.q}
          </h2>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.o.map((optionText, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswerIndex === idx;
              const isCorrectAnswer = idx === currentQ.a;

              let style = 'bg-[#151e32] border-[#29354e] text-slate-200 hover:border-violet-500/60';
              if (isSelected && !isChecked) {
                style = 'bg-violet-950/40 border-violet-500 text-white shadow-xs';
              } else if (isChecked) {
                if (isCorrectAnswer) {
                  style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrectAnswer) {
                  style = 'bg-rose-950/40 border-rose-500 text-rose-200';
                } else {
                  style = 'bg-[#12192b] border-[#202a3f] text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setSelectedAnswerIndex(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs flex items-center gap-3 transition-all cursor-pointer ${style}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'border-violet-400 bg-violet-600 text-white'
                        : 'border-[#334260] bg-[#1a253d] text-slate-400'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{optionText}</span>
                  {isChecked && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isChecked && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Card */}
          {isChecked && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                selectedAnswerIndex === currentQ.a
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                {selectedAnswerIndex === currentQ.a ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Not quite right.</span>
                  </>
                )}
              </div>
              <p className="text-slate-300">{currentQ.e}</p>

              {/* AI Deep Explanation Trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-700/30 text-[11px]">
                <button
                  type="button"
                  onClick={handleAskAITutorForQuestion}
                  disabled={loadingAi}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingAi ? 'AI Tutor explaining...' : 'Ask AI Tutor for deeper mnemonic & explanation'}</span>
                </button>
              </div>

              {aiExplanation && (
                <div className="mt-2 p-3 rounded-xl bg-[#0b101e] border border-cyan-800/40 text-cyan-200 text-xs whitespace-pre-wrap font-sans">
                  {aiExplanation}
                </div>
              )}
            </div>
          )}

          {/* Quiz Action Footer */}
          <div className="pt-4 border-t border-[#1c263c] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExitQuiz}
              className="py-2 px-3 rounded-xl bg-[#17223b] hover:bg-[#202e4d] text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Exit Quiz
            </button>

            {!isChecked ? (
              <button
                type="button"
                disabled={selectedAnswerIndex === null}
                onClick={handleCheckAnswer}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                Check Answer →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{currentIndex === activeQuestions.length - 1 ? 'See Results' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------- RESULT MODE ---------------- */}
      {quizState === 'result' && finalScore && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11192c] border border-[#222d43] shadow-2xl text-slate-100 text-center space-y-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Quiz Completed
          </div>

          {/* Circular Score Ring */}
          <div
            className="w-32 h-32 rounded-full mx-auto flex items-center justify-center relative shadow-xl"
            style={{
              background: `radial-gradient(circle, #0e1526 58%, transparent 60%), conic-gradient(#8b5cf6 ${finalScore.score}%, #222d44 0%)`,
            }}
          >
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white tabular-nums">
                {finalScore.score}%
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {finalScore.score >= 80
                ? 'Outstanding Progress!'
                : finalScore.score >= 60
                ? 'Good Effort — Building Mastery!'
                : 'Useful Starting Point!'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {finalScore.score >= 80
                ? 'Strong understanding shown. Review the explanations to make your retention permanent.'
                : finalScore.score >= 60
                ? "You are building solid comprehension. Focus next on the specific topics where you encountered difficulty."
                : 'Every attempt reveals high-yield revision topics. Use the Study Coach to master the fundamentals.'}
            </p>
          </div>

          {/* Correct / Total counts */}
          <div className="flex justify-center gap-10 py-4 border-y border-[#1e2a44] max-w-sm mx-auto">
            <div>
              <div className="text-2xl font-extrabold text-white tabular-nums">
                {finalScore.correct}/{finalScore.total}
              </div>
              <div className="text-[10px] text-slate-400">Correct Answers</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tabular-nums">
                {finalScore.total}
              </div>
              <div className="text-[10px] text-slate-400">Questions Answered</div>
            </div>
          </div>

          {/* Missed topics */}
          {(() => {
            const missedTopics = Array.from(
              new Set(recordedAnswers.filter((a) => !a.ok).map((a) => a.topic))
            );
            return (
              <div className="text-xs text-slate-400">
                {missedTopics.length > 0 ? (
                  <span>
                    Topics to revisit:{' '}
                    <b className="text-violet-300">{missedTopics.join(', ')}</b>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    Flawless score! You answered every question correctly.
                  </span>
                )}
              </div>
            );
          })()}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setQuizState('setup')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-600/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#17223b] hover:bg-[#202e4d] text-slate-200 font-bold text-xs border border-[#273654] transition-colors cursor-pointer"
            >
              View Analytics & Score Trends
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
