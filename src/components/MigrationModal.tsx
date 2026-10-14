import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DetectedLocalData } from '../services/firebase';
import { Database, ArrowRight, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  detected: DetectedLocalData;
  onClose: () => void;
}

export const MigrationModal: React.FC<Props> = ({ detected, onClose }) => {
  const { user, executeMigration } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [successResult, setSuccessResult] = useState<{ quizzesMigrated: number; sessionsMigrated: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleMigrate = async () => {
    if (!user) {
      setErrorMsg('Please sign in to your permanent account before migrating your local data.');
      return;
    }
    setMigrating(true);
    setErrorMsg('');
    try {
      const res = await executeMigration();
      setSuccessResult(res);
    } catch (err: any) {
      console.error('Migration failed:', err);
      setErrorMsg(err.message || 'Migration encountered an issue. Your local data remains safe in this browser.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#11192c] border border-cyan-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              One-Time Cloud Import
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Migrate Local Browser Data
            </h2>
          </div>
        </div>

        {successResult ? (
          <div className="flex flex-col gap-4 my-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <b className="block text-emerald-300 font-bold mb-1">Migration Successful!</b>
                Successfully transferred <b>{successResult.quizzesMigrated}</b> quiz attempts and{' '}
                <b>{successResult.sessionsMigrated}</b> study sessions to your authenticated Firestore account ({user?.email}).
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Your historical data is now permanently available across any browser or device whenever you sign in.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done & Return to Workspace
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              We detected learning progress stored in this browser from your earlier session. You can safely import this data into your permanent Firestore cloud account.
            </p>

            {/* Data summary box */}
            <div className="p-4 rounded-2xl bg-[#0d1425] border border-[#232f48] mb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Detected Local Records</span>
                <span className="text-cyan-400 font-mono text-[10px]">{detected.rawKey}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#151e32]">
                  <div className="text-lg font-extrabold text-white tabular-nums">{detected.quizCount}</div>
                  <div className="text-[10px] text-slate-400">Quiz Attempts</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#151e32]">
                  <div className="text-lg font-extrabold text-white tabular-nums">{detected.sessionCount}</div>
                  <div className="text-[10px] text-slate-400">Study Sessions</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#151e32]">
                  <div className="text-xs font-bold text-slate-200 truncate">{detected.profileName}</div>
                  <div className="text-[10px] text-slate-400">Learner Name</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-2.5 text-[11px] text-cyan-200 mb-5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <b>Zero Data Loss:</b> Your original browser data will not be modified or deleted during this migration. It is safely duplicated to your secure cloud database.
              </span>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#17223b] hover:bg-[#202d4d] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleMigrate}
                disabled={migrating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {migrating ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <span>Import to Cloud</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
