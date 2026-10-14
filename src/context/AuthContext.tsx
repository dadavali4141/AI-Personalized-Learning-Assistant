import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  testConnection,
  fetchUserProfile,
  saveUserProfile,
  recordQuizAttempt,
  fetchQuizAttempts,
  clearAllQuizAttempts,
  recordStudySession,
  fetchStudySessions,
  recordActivity,
  fetchActivityLogs,
  deleteAccountAndData,
  detectLegacyLocalStorage,
  migrateLegacyToFirestore,
  DetectedLocalData,
} from '../services/firebase';
import { UserProfile, QuizAttempt, StudySession, ActivityItem } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  loading: boolean;
  quizzes: QuizAttempt[];
  sessions: StudySession[];
  activity: ActivityItem[];
  isGuestDemo: boolean;
  legacyDataDetected: DetectedLocalData | null;
  saveProfileData: (data: Partial<UserProfile>) => Promise<void>;
  saveQuizAttemptData: (attempt: Omit<QuizAttempt, 'id'>) => Promise<string>;
  saveStudySessionData: (session: Omit<StudySession, 'id'>) => Promise<string>;
  clearHistoryData: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  executeMigration: () => Promise<{ quizzesMigrated: number; sessionsMigrated: number }>;
  dismissMigration: () => void;
  signInWithGoogle: () => Promise<void>;
  signInEmailPassword: (e: string, p: string) => Promise<void>;
  signUpEmailPassword: (e: string, p: string, name: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  logOut: () => Promise<void>;
  enableGuestDemo: () => void;
  refreshUserData: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: 'Alex Student',
  email: '',
  course: 'B.Tech Computer Engineering',
  semester: 'Semester 4',
  goal: 'Improve exam performance',
  duration: '25',
  about: 'Focusing on building deep fundamentals in algorithms, databases, and system architecture.',
  weeklyGoal: 180,
  focus: 'Python',
  confidence: 'Medium',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isGuestDemo, setIsGuestDemo] = useState(false);
  const [legacyDataDetected, setLegacyDataDetected] = useState<DetectedLocalData | null>(null);

  // Initial connection test
  useEffect(() => {
    testConnection();
    // Check for existing local storage data from previous version
    const detected = detectLegacyLocalStorage();
    if (detected) {
      setLegacyDataDetected(detected);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setIsGuestDemo(false);
        try {
          // Load User Profile from Firestore
          let existingProfile = await fetchUserProfile(currentUser.uid);
          if (!existingProfile) {
            // First time sign-in: create initial profile using auth identity
            const newProfile: UserProfile = {
              ...defaultProfile,
              name: currentUser.displayName || defaultProfile.name,
              email: currentUser.email || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveUserProfile(currentUser.uid, newProfile);
            existingProfile = newProfile;
          }
          setProfile(existingProfile);

          // Load Quizzes, Sessions, Activity
          const [loadedQuizzes, loadedSessions, loadedActivity] = await Promise.all([
            fetchQuizAttempts(currentUser.uid),
            fetchStudySessions(currentUser.uid),
            fetchActivityLogs(currentUser.uid),
          ]);

          setQuizzes(loadedQuizzes);
          setSessions(loadedSessions);
          setActivity(loadedActivity);
        } catch (err) {
          console.error('Error loading student data from Firestore:', err);
        }
      } else {
        setUser(null);
        // If not logged in and not guest, reset to defaults
        if (!isGuestDemo) {
          setProfile(defaultProfile);
          setQuizzes([]);
          setSessions([]);
          setActivity([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuestDemo]);

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const [p, q, s, a] = await Promise.all([
        fetchUserProfile(user.uid),
        fetchQuizAttempts(user.uid),
        fetchStudySessions(user.uid),
        fetchActivityLogs(user.uid),
      ]);
      if (p) setProfile(p);
      setQuizzes(q);
      setSessions(s);
      setActivity(a);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const saveProfileData = async (updated: Partial<UserProfile>) => {
    const merged: UserProfile = { ...profile, ...updated };
    setProfile(merged);

    if (user) {
      await saveUserProfile(user.uid, merged);
      await recordActivity(user.uid, {
        title: 'Profile updated',
        detail: `Updated learning preferences (Focus: ${merged.focus})`,
        icon: '◎',
        at: new Date().toISOString(),
        day: new Date().toISOString().split('T')[0],
      });
      const refreshedAct = await fetchActivityLogs(user.uid);
      setActivity(refreshedAct);
    }
  };

  const saveQuizAttemptData = async (attempt: Omit<QuizAttempt, 'id'>) => {
    if (user) {
      const id = await recordQuizAttempt(user.uid, attempt);
      const newAttempt: QuizAttempt = { ...attempt, id };
      setQuizzes((prev) => [newAttempt, ...prev]);

      await recordActivity(user.uid, {
        title: 'Quiz completed',
        detail: `${attempt.subject} · ${attempt.score}% (${attempt.correct}/${attempt.total})`,
        icon: '✓',
        at: new Date().toISOString(),
        day: attempt.day,
      });

      const refreshedAct = await fetchActivityLogs(user.uid);
      setActivity(refreshedAct);
      return id;
    } else {
      // Local in-memory guest fallback
      const fakeId = `local_quiz_${Date.now()}`;
      const newAttempt: QuizAttempt = { ...attempt, id: fakeId };
      setQuizzes((prev) => [newAttempt, ...prev]);
      setActivity((prev) => [
        {
          id: `act_${Date.now()}`,
          title: 'Quiz completed (Guest)',
          detail: `${attempt.subject} · ${attempt.score}% (${attempt.correct}/${attempt.total})`,
          icon: '✓',
          at: new Date().toISOString(),
          day: attempt.day,
        },
        ...prev,
      ]);
      return fakeId;
    }
  };

  const saveStudySessionData = async (session: Omit<StudySession, 'id'>) => {
    if (user) {
      const id = await recordStudySession(user.uid, session);
      const newSession: StudySession = { ...session, id };
      setSessions((prev) => [newSession, ...prev]);

      await recordActivity(user.uid, {
        title: 'Study session logged',
        detail: `${session.minutes} min · ${session.subject}${session.note ? ' — ' + session.note : ''}`,
        icon: '◷',
        at: new Date().toISOString(),
        day: session.day,
      });

      const refreshedAct = await fetchActivityLogs(user.uid);
      setActivity(refreshedAct);
      return id;
    } else {
      const fakeId = `local_sess_${Date.now()}`;
      const newSession: StudySession = { ...session, id: fakeId };
      setSessions((prev) => [newSession, ...prev]);
      return fakeId;
    }
  };

  const clearHistoryData = async () => {
    if (user) {
      await clearAllQuizAttempts(user.uid);
      setQuizzes([]);
      await recordActivity(user.uid, {
        title: 'Quiz history cleared',
        detail: 'Cleared past quiz attempt records',
        icon: '↻',
        at: new Date().toISOString(),
        day: new Date().toISOString().split('T')[0],
      });
      const refreshedAct = await fetchActivityLogs(user.uid);
      setActivity(refreshedAct);
    } else {
      setQuizzes([]);
    }
  };

  const deleteUserAccount = async () => {
    if (user) {
      await deleteAccountAndData(user);
      setUser(null);
      setProfile(defaultProfile);
      setQuizzes([]);
      setSessions([]);
      setActivity([]);
    }
  };

  const executeMigration = async () => {
    if (!user || !legacyDataDetected) {
      throw new Error('Must be authenticated with detected local data to migrate.');
    }
    const result = await migrateLegacyToFirestore(user.uid, legacyDataDetected);
    setLegacyDataDetected(null);
    await refreshUserData();
    return result;
  };

  const dismissMigration = () => {
    setLegacyDataDetected(null);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const signInEmailPassword = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  const signUpEmailPassword = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user && name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      throw err;
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setIsGuestDemo(false);
  };

  const enableGuestDemo = () => {
    setIsGuestDemo(true);
    setUser(null);
    setProfile({
      ...defaultProfile,
      name: 'Guest Learner',
      email: 'guest@learnai.local',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        quizzes,
        sessions,
        activity,
        isGuestDemo,
        legacyDataDetected,
        saveProfileData,
        saveQuizAttemptData,
        saveStudySessionData,
        clearHistoryData,
        deleteUserAccount,
        executeMigration,
        dismissMigration,
        signInWithGoogle,
        signInEmailPassword,
        signUpEmailPassword,
        resetPassword,
        logOut,
        enableGuestDemo,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
