# Security Specification for LearnAI Firestore Rules

## 1. Data Invariants
- **User Scoping & Isolation**: All student records (profiles, quiz attempts, study sessions, activity logs, and AI conversations) are stored strictly under `/users/{userId}/...` where `{userId}` must match `request.auth.uid`.
- **Cross-User Protection**: No authenticated user can read, list, create, update, or delete any record in another user's document path.
- **Unauthenticated Protection**: Unauthenticated requests (`request.auth == null`) are rejected on all paths.
- **Field-Level Integrity**: Documents must not contain unexpected fields or malicious script tags. Strings are length-bounded to prevent Denial of Wallet.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Profile Read**: `GET /users/userA` with `auth = null` -> DENIED.
2. **Cross-User Profile Read**: `GET /users/userA` with `auth = { uid: "userB" }` -> DENIED.
3. **Cross-User Profile Write**: `SET /users/userA` with `auth = { uid: "userB" }` -> DENIED.
4. **Cross-User Quiz List**: `LIST /users/userA/quizzes` with `auth = { uid: "userB" }` -> DENIED.
5. **Cross-User Quiz Create**: `CREATE /users/userA/quizzes/q1` with `auth = { uid: "userB" }` -> DENIED.
6. **Cross-User Session Delete**: `DELETE /users/userA/sessions/s1` with `auth = { uid: "userB" }` -> DENIED.
7. **Cross-User Activity Read**: `GET /users/userA/activity/act1` with `auth = { uid: "userB" }` -> DENIED.
8. **Root Collection Poisoning**: `CREATE /quizzes/fake` -> DENIED (default-deny catch-all).
9. **Admin Impersonation**: Attempting to write an arbitrary admin claim into user profile -> DENIED.
10. **Over-length Name Injection**: Setting profile `name` with > 100 characters or binary blobs -> DENIED.
11. **Negative Score/Invalid Fields**: Setting quiz attempt score < 0 or > 100 -> DENIED.
12. **Cross-User AI History Access**: `GET /users/userA/ai_conversations/c1` with `auth = { uid: "userB" }` -> DENIED.
