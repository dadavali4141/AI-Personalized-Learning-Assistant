import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subjects } from '../data/learningData';
import { PageId } from '../types';
import {
  Sparkles,
  Target,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface Props {
  onNavigate: (page: PageId) => void;
  onStartQuiz: (subjectId: string) => void;
  onShowToast: (msg: string) => void;
}

export const StudyCoachView: React.FC<Props> = ({
  onNavigate,
  onStartQuiz,
  onShowToast,
}) => {
  const { profile, quizzes, sessions, saveProfileData } = useAuth();

  // Goal form local state
  const [weeklyGoal, setWeeklyGoal] = useState<number>(profile.weeklyGoal || 180);
  const [focusArea, setFocusArea] = useState<string>(profile.focus || 'Python');
  const [confidence, setConfidence] = useState<'Low' | 'Medium' | 'High'>(profile.confidence || 'Medium');
  const [savingGoals, setSavingGoals] = useState(false);

  // Total study minutes logged
  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);
  const currentGoal = Number(profile.weeklyGoal) || 180;
  const goalPercent = Math.min(100, Math.round((totalMinutes / currentGoal) * 100));

  // Subject performance stats
  const subjectScores: Record<string, { attempts: number; sum: number }> = {};
  subjects.forEach((s) => {
    subjectScores[s.id] = { attempts: 0, sum: 0 };
  });
  quizzes.forEach((q) => {
    if (!subjectScores[q.subject]) {
      subjectScores[q.subject] = { attempts: 0, sum: 0 };
    }
    subjectScores[q.subject].attempts++;
    subjectScores[q.subject].sum += q.score;
  });

  // Identify weak areas (<80%)
  const weakSubjects = subjects
    .filter((s) => subjectScores[s.id]?.attempts > 0)
    .map((s) => ({
      ...s,
      avg: Math.round(subjectScores[s.id].sum / subjectScores[s.id].attempts),
    }))
    .filter((s) => s.avg < 80)
    .sort((a, b) => a.avg - b.avg);

  // Generate personalized 4-step plan
  const generateSteps = () => {
    const steps: { title: string; desc: string; time: string; subjectId?: string }[] = [];

    // Step 0 for Low confidence
    if (confidence === 'Low') {
      steps.push({
        title: 'Foundational Deconstruction',
        desc: 'Break your topic into one atomic concept. Write out the definition and diagram the relationship before writing code or answering tests.',
        time: '10 min',
      });
    }

    // Step 1: Weakest or Focus subject
    if (weakSubjects.length > 0) {
      const weakest = weakSubjects[0];
      steps.push({
        title: `Remediate ${weakest.name} Core Concepts`,
        desc: `Your saved quiz average is ${weakest.avg}%. Re-read key notes on ${weakest.topics[0]} and explain the main principle in your own words.`,
        time: '15 min',
        subjectId: weakest.id,
      });
    } else {
      steps.push({
        title: `Deepen ${focusArea} Fundamentals`,
        desc: `Choose a challenging subtopic in ${focusArea}. Review syntax rules and construct a minimal working example without looking at solutions.`,
        time: `${profile.duration || 25} min`,
        subjectId: focusArea,
      });
    }

    // Step 2: Active Recall Testing
    steps.push({
      title: 'Active Recall Practice',
      desc: 'Take a 5-10 question practice quiz. Study every explanation carefully, especially when guessing.',
      time: '10–15 min',
    });

    // Step 3: Reflection & Logging
    steps.push({
      title: 'Synthesize & Log Reflection',
      desc: 'Record your study session minutes in the Learning Library. Note down one key realization and one open question for your next session.',
      time: '3 min',
    });

    return steps.slice(0, 4);
  };

  const steps = generateSteps();

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoals(true);
    try {
      await saveProfileData({
        weeklyGoal: Number(weeklyGoal),
        focus: focusArea,
        confidence,
      });
      onShowToast('Personal learning goals saved!');
    } catch (err) {
      console.error('Error saving goals:', err);
      onShowToast('Could not save goals. Please try again.');
    } finally {
      setSavingGoals(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            — Your Learning Companion
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Personalized Study Coach
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            An adaptive study routine synthesized from your quiz history, diagnostic weak topics, and target commitments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tutor')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#1e2a44] hover:bg-[#27385c] text-cyan-300 border border-cyan-800/40 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Consult Live AI Tutor →</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: Suggested Plan */}
        <div className="lg:col-span-8 space-y-5">
          <article className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20">
                  ✦
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Your Custom Study Plan</h2>
                  <p className="text-xs text-slate-400">
                    Targeted activities tailored to your knowledge baseline
                  </p>
                </div>
              </div>

              <button
                onClick={() => onShowToast('Plan refreshed with latest quiz performance.')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Coach Greeting Callout */}
            <div className="p-4 rounded-2xl bg-[#1a2140] border border-[#34315d] flex items-start gap-3.5">
              <span className="text-violet-300 font-bold text-lg">✦</span>
              <div className="text-xs leading-relaxed">
                <b className="block text-violet-200 text-sm font-bold mb-0.5">
                  Let's make your next study sprint count, {profile.name.split(/\s+/)[0] || 'learner'}.
                </b>
                <p className="text-slate-300">
                  {quizzes.length > 0
                    ? `You've completed ${quizzes.length} quiz attempts. Follow this 4-step sequence to strengthen tricky areas and maintain momentum.`
                    : 'Start with a short diagnostic quiz to establish your baseline. Recommendations automatically adapt as you record quiz answers.'}
                </p>
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-3">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#141d30] border border-[#232f48] flex items-start justify-between gap-4 hover:border-violet-500/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white">{st.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                      {st.time}
                    </span>
                    {st.subjectId && (
                      <button
                        onClick={() => onStartQuiz(st.subjectId!)}
                        className="text-[11px] font-bold text-violet-400 hover:text-white transition-colors"
                      >
                        Practice →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-[#1c263c] pt-4">
              ⓘ Recommendations are generated using transparent diagnostic logic based on your stored quiz attempts, weak topics (&lt;80%), and weekly targets.
            </p>
          </article>
        </div>

        {/* Sidebar Column: Personal Goals Form */}
        <div className="lg:col-span-4 space-y-5">
          <article className="p-6 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                <span>Learning Goals</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Shape your coach recommendations</p>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                <span>Weekly Study Target (minutes)</span>
                <input
                  type="number"
                  min={30}
                  max={3000}
                  step={30}
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Math.max(30, parseInt(e.target.value, 10) || 0))}
                  className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500 tabular-nums"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                <span>Primary Focus Subject</span>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                <span>Self-Assessed Confidence</span>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as any)}
                  className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                >
                  <option value="Low">Low (Need more basic explanations)</option>
                  <option value="Medium">Medium (Balanced practice)</option>
                  <option value="High">High (Ready for advanced challenges)</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={savingGoals}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingGoals ? 'Saving...' : 'Save Learning Goals'}
              </button>
            </form>

            {/* Weekly Target Progress Track */}
            <div className="pt-4 border-t border-[#1c263c] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">This Week's Logged Time</span>
                <span className="font-bold text-white tabular-nums">
                  {totalMinutes} / {currentGoal} min
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1e2942] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                {goalPercent >= 100 ? '🎉 Weekly target achieved!' : `${currentGoal - totalMinutes} min left to target`}
              </div>
            </div>

            {/* Focus Sprint Prompt */}
            <div className="p-3.5 rounded-2xl bg-[#162038] border border-[#273656] text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Try a 25-min Sprint</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Study one concept without switching tabs, then answer 5 quick questions in Practice Quiz.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
