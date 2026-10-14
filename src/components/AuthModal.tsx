import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const {
    signInWithGoogle,
    signInEmailPassword,
    signUpEmailPassword,
    resetPassword,
    enableGuestDemo,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }
        await signInEmailPassword(email.trim(), password);
        onClose();
      } else if (mode === 'signup') {
        if (!email.trim() || !password) {
          throw new Error('Please enter an email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpEmailPassword(email.trim(), password, fullName.trim() || 'Student');
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email to receive password reset instructions.');
        }
        await resetPassword(email.trim());
        setSuccessMsg(`Password reset email sent to ${email.trim()}. Check your inbox.`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please try again or reset your password.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email. Please sign up first.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Sign-in popup was closed before finishing.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      let msg = err.message || 'Google sign-in could not be completed.';
      if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Sign-in popup was closed before completion.';
      } else if (msg.includes('auth/unauthorized-domain')) {
        msg = 'This domain is not yet authorized in Firebase Console > Authentication > Settings > Authorized domains.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#11192c] border border-[#2b3752] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-violet-500/25 mb-3">
            ✦
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Personalized Learning Space
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {mode === 'signin' && 'Welcome back to LearnAI'}
            {mode === 'signup' && 'Create your Student Account'}
            {mode === 'forgot' && 'Reset your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
            {mode === 'signin' && 'Sign in to access your persistent scores, study sessions, and recommendations.'}
            {mode === 'signup' && 'Join LearnAI to track your academic progress, earn streaks, and learn with AI.'}
            {mode === 'forgot' && 'Enter your email address and we will send you a password reset link.'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
              <span>Full Name</span>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Student"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
            <span>Email Address</span>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </label>

          {mode !== 'forgot' && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-300">
              <div className="flex items-center justify-between">
                <span>Password</span>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0d1425] border border-[#26324b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#202b42]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
                <span className="bg-[#11192c] px-3">or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer switches */}
        <div className="mt-5 pt-4 border-t border-[#1e2a44] flex flex-col items-center gap-2 text-xs text-slate-400">
          {mode === 'signin' ? (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              enableGuestDemo();
              onClose();
            }}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors mt-1"
          >
            Continue in local guest mode (temporary)
          </button>
        </div>
      </div>
    </div>
  );
};
