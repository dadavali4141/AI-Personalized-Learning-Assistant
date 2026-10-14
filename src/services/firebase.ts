import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, QuizAttempt, StudySession, ActivityItem, AIConversation } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting.');
    }
    return false;
  }
}

// ---------------- USER PROFILE ----------------
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- QUIZZES ----------------
export async function recordQuizAttempt(uid: string, attempt: Omit<QuizAttempt, 'id'>): Promise<string> {
  const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${uid}/quizzes/${quizId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'quizzes', quizId), {
      ...attempt,
      id: quizId,
    });
    return quizId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchQuizAttempts(uid: string): Promise<QuizAttempt[]> {
  const path = `users/${uid}/quizzes`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'quizzes'));
    const list: QuizAttempt[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as QuizAttempt);
    });
    // Sort newest first
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function clearAllQuizAttempts(uid: string): Promise<void> {
  const path = `users/${uid}/quizzes`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'quizzes'));
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- STUDY SESSIONS ----------------
export async function recordStudySession(uid: string, session: Omit<StudySession, 'id'>): Promise<string> {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${uid}/sessions/${sessionId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'sessions', sessionId), {
      ...session,
      id: sessionId,
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchStudySessions(uid: string): Promise<StudySession[]> {
  const path = `users/${uid}/sessions`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const list: StudySession[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as StudySession);
    });
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ---------------- ACTIVITY LOGS ----------------
export async function recordActivity(uid: string, item: Omit<ActivityItem, 'id'>): Promise<void> {
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${uid}/activity/${activityId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'activity', activityId), {
      ...item,
      id: activityId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchActivityLogs(uid: string, maxItems: number = 20): Promise<ActivityItem[]> {
  const path = `users/${uid}/activity`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'activity'));
    const list: ActivityItem[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as ActivityItem);
    });
    return list
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, maxItems);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ---------------- AI CONVERSATIONS ----------------
export async function recordAIConversation(uid: string, item: Omit<AIConversation, 'id'>): Promise<void> {
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${uid}/ai_conversations/${convId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'ai_conversations', convId), {
      ...item,
      id: convId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAIConversations(uid: string): Promise<AIConversation[]> {
  const path = `users/${uid}/ai_conversations`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'ai_conversations'));
    const list: AIConversation[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as AIConversation);
    });
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ---------------- ACCOUNT PURGE & DELETION ----------------
export async function deleteAccountAndData(currentUser: User): Promise<void> {
  const uid = currentUser.uid;
  // 1. Delete all subcollections
  const subcollections = ['quizzes', 'sessions', 'activity', 'ai_conversations'];
  for (const sub of subcollections) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, sub));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (e) {
      console.warn(`Failed cleaning subcollection ${sub}:`, e);
    }
  }

  // 2. Delete user document
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (e) {
    console.warn('Failed deleting user doc:', e);
  }

  // 3. Delete Firebase Auth User
  await deleteUser(currentUser);
}

// ---------------- LEGACY LOCAL STORAGE MIGRATION ----------------
export interface DetectedLocalData {
  hasLegacyData: boolean;
  profileName: string;
  email: string;
  quizCount: number;
  sessionCount: number;
  quizzes: any[];
  sessions: any[];
  rawKey: string;
}

export function detectLegacyLocalStorage(): DetectedLocalData | null {
  try {
    const activeEmail = localStorage.getItem('learnai_active_account') || 'demo@learnai.local';
    const specificKey = `learnai_app_v1_account_${encodeURIComponent(activeEmail.trim().toLowerCase())}`;
    
    let raw = localStorage.getItem(specificKey);
    let usedKey = specificKey;
    if (!raw) {
      raw = localStorage.getItem('learnai_app_v1');
      usedKey = 'learnai_app_v1';
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || (!parsed.quizzes?.length && !parsed.sessions?.length && !parsed.profile?.name)) {
      return null;
    }

    return {
      hasLegacyData: true,
      profileName: parsed.profile?.name || 'Local Student',
      email: parsed.profile?.email || activeEmail,
      quizCount: parsed.quizzes?.length || 0,
      sessionCount: parsed.sessions?.length || 0,
      quizzes: parsed.quizzes || [],
      sessions: parsed.sessions || [],
      rawKey: usedKey,
    };
  } catch (e) {
    console.error('Error detecting legacy local storage:', e);
    return null;
  }
}

export async function migrateLegacyToFirestore(uid: string, localData: DetectedLocalData): Promise<{ quizzesMigrated: number; sessionsMigrated: number }> {
  let quizzesMigrated = 0;
  let sessionsMigrated = 0;

  // Import quizzes
  for (const q of localData.quizzes) {
    try {
      await recordQuizAttempt(uid, {
        subject: q.subject || 'General',
        difficulty: q.difficulty || 'Intermediate',
        score: Number(q.score) || 0,
        correct: Number(q.correct) || 0,
        total: Number(q.total) || 1,
        answers: q.answers || [],
        at: q.at || new Date().toISOString(),
        day: q.day || new Date().toISOString().split('T')[0],
      });
      quizzesMigrated++;
    } catch (e) {
      console.warn('Skipped migrating quiz attempt:', e);
    }
  }

  // Import sessions
  for (const s of localData.sessions) {
    try {
      await recordStudySession(uid, {
        subject: s.subject || 'General',
        minutes: Number(s.minutes) || 25,
        note: s.note || '',
        at: s.at || new Date().toISOString(),
        day: s.day || new Date().toISOString().split('T')[0],
      });
      sessionsMigrated++;
    } catch (e) {
      console.warn('Skipped migrating study session:', e);
    }
  }

  // Log migration activity
  await recordActivity(uid, {
    title: 'Migrated Browser Data',
    detail: `Imported ${quizzesMigrated} quiz attempts & ${sessionsMigrated} study sessions from local storage.`,
    icon: '⇪',
    at: new Date().toISOString(),
    day: new Date().toISOString().split('T')[0],
  });

  return { quizzesMigrated, sessionsMigrated };
}
