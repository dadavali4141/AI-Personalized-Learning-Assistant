# LearnAI — AI-Powered Personalized Learning Assistant

Aligned with **United Nations Sustainable Development Goal 4 (Quality Education)**, LearnAI is a modern, responsive, full-stack educational web application designed to help students master computer science concepts through diagnostic testing, adaptive study coaching, real-time AI mentoring, and account-specific persistent tracking.

---

## 1. System Architecture & Workflow

The learning workflow follows a cyclical, data-backed pedagogy:

```
Select Subject ➔ Diagnose Knowledge ➔ Explain Concepts ➔ Take Quizzes ➔ Record Results ➔ Recommend Study Activities ➔ Identify Weak Areas ➔ Evaluate Improvement
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend / API**: Express 4 server running on Node.js (`server.ts`) with Vite dev middleware in development and static asset serving in production.
- **AI Mentorship**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` on server-side endpoints (`/api/tutor/chat`, `/api/tutor/quiz-explain`, `/api/tutor/explain-topic`).
- **Database & Persistence**: Google Cloud Firestore (`firebase-applet-config.json` with deployed `firestore.rules`).
- **Authentication**: Firebase Authentication supporting Email/Password, Google Sign-In (`signInWithPopup`), password reset, account deletion, and persistent sessions.

---

## 2. Key Features

### ✦ Diagnostic Quiz System (39 Preserved & Enhanced Questions)
- Preserves all 39 questions across all 6 curriculum subjects:
  1. **Python Programming** (Variables, Data types, Loops, Functions, Strings, Exceptions, Lambdas)
  2. **Java Programming** (Classes, OOP, Inheritance, Polymorphism, Overloading)
  3. **Database Management Systems (DBMS)** (SQL, Keys, Normalization, Joins, ACID transactions)
  4. **Computer Networks** (OSI 7-layer model, TCP/IP, IP addressing, DNS, HTTPS)
  5. **Operating Systems** (Processes, CPU Scheduling, Round Robin, Deadlocks, Virtual Memory)
  6. **Data Structures and Algorithms** (Arrays, Stacks, Queues, Binary Search, Trees, Graphs)
- Configurable question count (5, 10, 15, or all 39).
- Instant verification with detailed educational explanations.
- One-click "Ask AI Tutor" deep-dive on tricky questions.
- High-score confetti celebration (80%+).

### ✦ Permanent, Account-Specific Cloud Firestore Storage
- Strict zero-trust data scoping under `/users/{auth.currentUser.uid}/...`.
- Saves and restores:
  - Student profile, degree course, semester, primary goals, focus area, confidence.
  - Quiz attempts, answer histories, and scores.
  - Study session minutes and reflection notes.
  - Activity log with timestamps.
  - AI Tutor conversation history.
- Student A and Student B have strictly partitioned accounts: logging in as Student B displays only Student B's records; logging back into Student A restores Student A's data completely.

### ✦ Study Coach & Weekly Target Tracking
- Identifies weak curriculum domains (average quiz score < 80%).
- Synthesizes an adaptive 4-step daily study sprint (Foundational Deconstruction, Core Remediation, Active Recall Practice, Reflection).
- Interactive weekly goal progress tracking (e.g. 120 / 180 min).

### ✦ Real-Time AI Tutor (Server-Side Gemini 3.8 Flash)
- Explains concepts with customizable depth: Beginner, College / Undergraduate, or Advanced.
- Explains why a specific quiz choice was incorrect and provides memorable mnemonics.
- Server-side proxy keeps secret API keys secure from client browser bundles.
- Transparent non-AI fallback when API keys are not supplied.

### ✦ Progress Analytics & Verified CSV Reports
- Canvas area line chart visualizing score trajectories over recent quiz attempts.
- Subject-by-subject percentage comparison bars.
- Complete quiz attempt history table with score pills.
- One-click CSV report export containing student profile metadata, quiz histories, and study sessions.

### ✦ Legacy Browser Data Migration
- Inspects `localStorage` for `learnai_app_v1` and `learnai_app_v1_account_*` keys from previous prototypes.
- Safe, explicit migration dialog shows detected records before importing into the authenticated Firestore database without deleting original browser data.

---

## 3. Configuration & Firebase Setup

### Prerequisites
- Node.js 20+
- A Google Cloud / Firebase project configured with Cloud Firestore and Firebase Authentication.

### Configuration Files
- `firebase-applet-config.json`: Contains your Firebase project ID, web API key, auth domain, and Firestore database ID.
- `firestore.rules`: Enterprise-grade security rules deployed to Cloud Firestore enforcing ownership validation on `/users/{userId}/**`.
- `.env.example`: Environment variables template (`GEMINI_API_KEY`).

### Enabling Google Authentication in Firebase Console:
1. Open [Firebase Console](https://console.firebase.google.com/) and navigate to your project.
2. Under **Build**, select **Authentication** > **Sign-in method**.
3. Enable **Email/Password** and **Google**.
4. In **Settings** > **Authorized domains**, ensure your application's deployment domain is listed.

---

## 4. Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The full-stack application will launch at `http://localhost:3000` (or `http://0.0.0.0:3000`).

### 3. Build for Production
```bash
npm run build
```

### 4. Run Production Server
```bash
npm start
```

---

## 5. Security & Verification Checklist

- [x] **Zero Exposed Keys**: All Gemini API calls route through `/api/tutor/*` on `server.ts`.
- [x] **Firestore Security Rules Deployed**: Catch-all default deny with strict `request.auth.uid == userId` validation.
- [x] **Reactive State**: Firestore real-time updates and robust error handling.
- [x] **Clean Dark Theme UI**: Adheres to Universal Frontend Design Constitution (anti-slop, zero-pill metadata, single-line controls, high-contrast accessible typography).
