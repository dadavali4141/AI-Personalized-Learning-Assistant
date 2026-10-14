import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageId, Subject } from './types';
import { questionBank, subjects } from './data/learningData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AuthModal } from './components/AuthModal';
import { MigrationModal } from './components/MigrationModal';
import { SubjectDetailModal } from './components/SubjectDetailModal';

// Views
import { DashboardView } from './views/DashboardView';
import { LearningLibraryView } from './views/LearningLibraryView';
import { QuizView } from './views/QuizView';
import { StudyCoachView } from './views/StudyCoachView';
import { AITutorView } from './views/AITutorView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';

const MainAppContent: React.FC = () => {
  const { profile, quizzes, sessions, loading, legacyDataDetected, dismissMigration } = useAuth();

  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);

  // Cross-page navigation state
  const [quizInitialSubject, setQuizInitialSubject] = useState<string | undefined>();
  const [tutorInitialSubject, setTutorInitialSubject] = useState<string | undefined>();
  const [tutorInitialQuestion, setTutorInitialQuestion] = useState<string | undefined>();

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleStartQuizFromAnywhere = (subjectId?: string) => {
    setQuizInitialSubject(subjectId || subjects[0].id);
    setActivePage('quiz');
  };

  const handleAskAITutorFromAnywhere = (subject: Subject, question?: string) => {
    setTutorInitialSubject(subject.name);
    setTutorInitialQuestion(question || `Explain the core principles of ${subject.name} and common exam pitfalls.`);
    setActivePage('tutor');
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const avgScore =
      quizzes.length > 0
        ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length)
        : 'N/A';
    const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);

    const rows: (string | number)[][] = [
      ['LearnAI Academic Report'],
      ['Generated On', new Date().toLocaleString()],
      ['Student Name', profile.name],
      ['Course / Program', profile.course || 'N/A'],
      ['Semester', profile.semester || 'N/A'],
      ['Learning Goal', profile.goal],
      ['Focus Area', profile.focus],
      ['Confidence Level', profile.confidence],
      ['Total Quizzes Completed', quizzes.length],
      ['Average Quiz Score', typeof avgScore === 'number' ? `${avgScore}%` : avgScore],
      ['Total Logged Minutes', totalMinutes],
      [],
      ['--- QUIZ ATTEMPTS HISTORY ---'],
      ['Subject', 'Date', 'Score (%)', 'Correct', 'Total Questions', 'Difficulty Level'],
      ...quizzes.map((q) => [
        q.subject,
        q.day || q.at.split('T')[0],
        q.score,
        q.correct,
        q.total,
        q.difficulty === 'all' ? 'Mixed' : q.difficulty,
      ]),
      [],
      ['--- LOGGED STUDY SESSIONS ---'],
      ['Subject', 'Date', 'Minutes', 'Reflection Notes'],
      ...sessions.map((s) => [
        s.subject,
        s.day || s.at.split('T')[0],
        s.minutes,
        s.note || '',
      ]),
    ];

    const csvContent =
      '\uFEFF' +
      rows
        .map((r) =>
          r
            .map((field) => {
              const str = String(field ?? '').replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LearnAI-Report-${profile.name.replace(/\s+/g, '_')}-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('Your complete learning report has been downloaded (CSV).');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 animate-pulse flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/30">
          ✦
        </div>
        <div className="text-xs font-semibold tracking-wider uppercase text-slate-300">
          Loading LearnAI Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#edf2ff] flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalQuestions={questionBank.length}
      />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <TopBar
          activePage={activePage}
          onSelectPage={setActivePage}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenAuth={() => {
            setAuthModalMode('signin');
            setAuthModalOpen(true);
          }}
          onExportReport={handleExportCSV}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <DashboardView
              onNavigate={setActivePage}
              onStartQuiz={handleStartQuizFromAnywhere}
            />
          )}

          {activePage === 'learning' && (
            <LearningLibraryView
              onStartQuiz={handleStartQuizFromAnywhere}
              onOpenNotes={(s) => setSelectedSubjectDetail(s)}
              onAskAI={(s) => handleAskAITutorFromAnywhere(s)}
              onShowToast={showToast}
            />
          )}

          {activePage === 'quiz' && (
            <QuizView
              initialSubject={quizInitialSubject}
              onNavigate={setActivePage}
              onShowToast={showToast}
              onAskAIExplanation={(q, ctx) => {
                setTutorInitialQuestion(`Explain this question: "${q}"`);
                setActivePage('tutor');
              }}
            />
          )}

          {activePage === 'coach' && (
            <StudyCoachView
              onNavigate={setActivePage}
              onStartQuiz={handleStartQuizFromAnywhere}
              onShowToast={showToast}
            />
          )}

          {activePage === 'tutor' && (
            <AITutorView
              initialSubject={tutorInitialSubject}
              initialQuestion={tutorInitialQuestion}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsView
              onShowToast={showToast}
              onExportReport={handleExportCSV}
            />
          )}

          {activePage === 'profile' && (
            <ProfileView
              onShowToast={showToast}
              onOpenAuth={() => {
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#1a2338] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">LearnAI</span>
            <span>·</span>
            <span>Personalized Learning Assistant</span>
            <span>·</span>
            <span className="text-cyan-400">UN SDG 4: Quality Education</span>
          </div>
          <div>Learning is a continuous journey, not a race.</div>
        </footer>
      </div>

      {/* Modals */}
      <SubjectDetailModal
        subject={selectedSubjectDetail}
        onClose={() => setSelectedSubjectDetail(null)}
        onStartQuiz={handleStartQuizFromAnywhere}
        onAskAI={(s) => handleAskAITutorFromAnywhere(s)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {legacyDataDetected && (
        <MigrationModal
          detected={legacyDataDetected}
          onClose={dismissMigration}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#142036] border border-cyan-800/60 text-cyan-200 text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
