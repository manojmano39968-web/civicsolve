import React from 'react';
import { RotateCcw, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DemoResetModal({ isOpen, onClose, onResetComplete }) {
  const { resetDemo, isResetting } = useAuth();
  const [successMsg, setSuccessMsg] = React.useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await resetDemo();
      setSuccessMsg('CivicSolve demo state restored to clean initial seed data!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        if (onResetComplete) onResetComplete();
      }, 1200);
    } catch (err) {
      alert('Failed to reset demo: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Reset Demo State</span>
            </div>
            <button
              onClick={onClose}
              disabled={isResetting}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successMsg ? (
            <div className="py-6 flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mb-2 animate-bounce" />
              <div className="font-semibold text-slate-900">{successMsg}</div>
              <div className="text-xs text-slate-500 mt-1">Ready for next demonstration run.</div>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-0.5">Judge Demo Reset Notice</div>
                  This will reload the initial 8 civic challenges, restore the hero Chennai Flooding team, reset task checklists, and re-establish baseline pilot impact metrics.
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to restore the clean state? Any temporary problems created during testing will be removed.
              </p>
            </div>
          )}

          {!successMsg && (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isResetting}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isResetting}
                id="confirm-reset-btn"
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring Seed Data...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
