export interface UserProfile {
  name: string;
  email: string;
  course: string;
  semester: string;
  goal: string;
  duration: string;
  about: string;
  weeklyGoal: number;
  focus: string;
  confidence: 'Low' | 'Medium' | 'High';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAnswer {
  ok: boolean;
  topic: string;
  question?: string;
  selected?: number;
  correct?: number;
}

export interface QuizAttempt {
  id?: string;
  subject: string;
  difficulty: string;
  score: number;
  correct: number;
  total: number;
  answers: QuizAnswer[];
  at: string;
  day: string;
}

export interface StudySession {
  id?: string;
  subject: string;
  minutes: number;
  note: string;
  at: string;
  day: string;
}

export interface ActivityItem {
  id?: string;
  title: string;
  detail: string;
  icon: string;
  at: string;
  day: string;
}

export interface AIConversation {
  id?: string;
  subject: string;
  question: string;
  answer: string;
  at: string;
}

export interface Subject {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: 'purple' | 'cyan' | 'teal' | 'gold' | 'blue';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  desc: string;
  topics: string[];
  minutes: number;
  learningObjectives: string[];
  keyConcept: string;
  codeSnippet?: string;
}

export interface QuizQuestion {
  s: string; // subject
  d: 'Beginner' | 'Intermediate' | 'Advanced'; // difficulty
  q: string; // question
  o: string[]; // options
  a: number; // correct answer index
  e: string; // explanation
  topic: string; // topic
}

export type PageId = 'dashboard' | 'learning' | 'quiz' | 'coach' | 'analytics' | 'profile' | 'tutor';
