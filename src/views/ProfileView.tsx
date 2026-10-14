import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subjects } from '../data/learningData';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Target,
  Clock,
  Award,
  Trash2,
  Save,
  CheckCircle2,
  Database,
  AlertTriangle,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<Props> = ({ onShowToast, onOpenAuth }) => {
  const {
    user,
    profile,
    quizzes,
    sessions,
    isGuestDemo,
    saveProfileData,
    deleteUserAccount,
    logOut,
    legacyDataDetected,
  } = useAuth();

  // Profile form local state
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || (user ? user.email || '' : ''));
  const [course, setCourse] = useState(profile.course || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [goal, setGoal] = useState(profile.goal || 'Improve exam performance');
  const [duration, setDuration] = useState(profile.duration || '25');
  const [about, setAbout] = useState(profile.about || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const totalQuizzes = quizzes.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
      : null;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);

  const getInitials = (n: string) => {
    return (n || 'S')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase() || 'S';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Name cannot be blank.');
      return;
    }
    setSaving(true);
    try {
      await saveProfileData({
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
        semester: semester.trim(),
        goal,
        duration,
        about: about.trim(),
      });
      onShowToast('Profile saved successfully to Cloud Firestore!');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      onShowToast('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      onShowToast('Please type DELETE in all caps to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await deleteUserAccount();
      setShowDeleteModal(false);
      onShowToast('Account and all associated records permanently deleted.');
    } catch (err: any) {
      console.error('Account deletion error:', err);
      onShowToast(err.message || 'Deletion failed. You may need to sign in again first.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            — Make This Space Yours
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Student Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal learning preferences, degree details, and persistent cloud identity.
          </p>
        </div>

        {!user && (
          <button
            onClick={onOpenAuth}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Connect Permanent Cloud Account</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-5">
          <article className="rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md overflow-hidden text-center">
            {/* Cover Gradient */}
            <div className="h-24 bg-gradient-to-r from-violet-600/40 via-indigo-600/40 to-cyan-500/30 border-b border-[#222d43]" />

            <div className="px-6 pb-6 pt-0 -mt-12">
              <div className="w-20 h-20 rounded-2xl mx-auto bg-gradient-to-tr from-violet-600 to-cyan-500 text-white text-2xl font-black flex items-center justify-center border-4 border-[#121a2d] shadow-xl">
                {getInitials(profile.name)}
              </div>

              <h2 className="text-lg font-bold text-white mt-3">{profile.name}</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
                {profile.email || (user ? user.email : 'Local Guest Account')}
              </p>

              {/* Status Badge */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-950/60 text-violet-300 border border-violet-800/40">
                {user ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloud Firestore Synced</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>In-Browser Session</span>
                  </>
                )}
              </div>

              {/* 3 mini stats */}
              <div className="grid grid-cols-3 gap-2 py-4 mt-4 border-y border-[#1e2a44] text-center">
                <div>
                  <div className="text-base font-extrabold text-white tabular-nums">{totalQuizzes}</div>
                  <div className="text-[10px] text-slate-400">Quizzes</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-white tabular-nums">
                    {avgScore !== null ? `${avgScore}%` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">Average</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-white tabular-nums">{totalMinutes}</div>
                  <div className="text-[10px] text-slate-400">Minutes</div>
                </div>
              </div>

              {/* Badges / Milestones */}
              <div className="mt-4 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Academic Milestones
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#18233a] text-cyan-300 border border-[#273654] flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>SDG 4 Learner</span>
                  </span>
                  {totalQuizzes >= 1 && (
                    <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#18233a] text-violet-300 border border-[#273654] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>First Diagnostic</span>
                    </span>
                  )}
                  {avgScore !== null && avgScore >= 80 && (
                    <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#18233a] text-emerald-300 border border-[#273654] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>High Scorer (80%+)</span>
                    </span>
                  )}
                  {totalMinutes >= 60 && (
                    <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#18233a] text-amber-300 border border-[#273654] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Study Marathon (1h+)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Account Actions Box */}
          <article className="p-5 rounded-3xl bg-[#11192c] border border-[#222d43] space-y-3 text-xs">
            <h3 className="font-bold text-white text-xs">Account Controls</h3>

            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => logOut()}
                  className="w-full py-2 px-3 rounded-xl bg-[#17223b] hover:bg-[#202d4b] text-slate-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of {user.email}</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Account & Wipe Cloud Data</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Sign In or Register</span>
              </button>
            )}
          </article>
        </div>

        {/* Right Column: Editable Profile Form */}
        <div className="lg:col-span-8">
          <article className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121a2d] to-[#0f1729] border border-[#222d43] shadow-md space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Student Details & Preferences</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved permanently under your authenticated user ID in Cloud Firestore
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Full Name</span>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={email}
                    disabled={!!user}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Degree / Course / Program</span>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. B.Tech Computer Engineering"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Current Semester</span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="e.g. Semester 4"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Primary Learning Goal</span>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option>Improve exam performance</option>
                    <option>Build programming skills</option>
                    <option>Strengthen fundamentals</option>
                    <option>Prepare for placements & interviews</option>
                    <option>Learn consistently</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                  <span>Preferred Study Sprint Duration</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="py-2.5 px-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="15">15 minutes (Quick micro-sprint)</option>
                    <option value="25">25 minutes (Pomodoro focus block)</option>
                    <option value="45">45 minutes (In-depth topic study)</option>
                    <option value="60">60 minutes (Comprehensive session)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
                <span>About Me (Academic background & targets)</span>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="What are your goals this term? Any specific topics or exams you are focusing on?"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="p-3 rounded-xl bg-[#0c1222] border border-[#26324b] text-white text-xs focus:outline-none focus:border-violet-500 resize-none"
                />
              </label>

              <div className="pt-3 border-t border-[#1c263c] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Changes save automatically to Cloud Firestore
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#11192c] border border-rose-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action is <b>irreversible</b>. It will permanently erase your student profile, all completed quiz attempts, study session logs, activity history, and AI tutor conversations from Cloud Firestore.
            </p>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300">
              Type <b>DELETE</b> below to confirm account wipeout.
            </div>

            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0c1222] border border-rose-800/50 text-white text-xs font-mono uppercase tracking-widest focus:outline-none"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#17223b] hover:bg-[#202d4b] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmation !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
