import React, { useEffect } from 'react';
import { AlertOctagon, ShieldAlert, X, Square } from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';

export const DrowsinessAlertModal: React.FC = () => {
  const { state, dismissAlert, stopMonitoring } = useDriveSafe();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.alertActive) {
        dismissAlert();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.alertActive, dismissAlert]);

  if (!state.alertActive) {
    return null;
  }

  const handleStop = () => {
    stopMonitoring();
  };

  return (
    <div
      id="drowsiness-alert-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div className="relative w-full max-w-lg rounded-xl border-2 border-red-500 bg-slate-950 p-6 shadow-2xl shadow-red-950/60 text-slate-100">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-950 border border-red-500/80 text-red-400 animate-pulse">
            <AlertOctagon className="h-7 w-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                Safety Warning Event
              </span>
              <button
                onClick={dismissAlert}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors"
                aria-label="Dismiss Alert Dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2
              id="alert-dialog-title"
              className="mt-1 text-2xl font-black tracking-tight text-white font-mono"
            >
              DROWSINESS ALERT
            </h2>
          </div>
        </div>

        {/* Message */}
        <div
          id="alert-dialog-description"
          className="mt-4 rounded-lg bg-red-950/40 border border-red-900/60 p-4 text-sm leading-relaxed text-red-200"
        >
          <p className="font-semibold text-white mb-1">
            Potential prolonged eye closure detected.
          </p>
          <p className="text-red-200/90">
            Please regain attention and stop safely if necessary.
          </p>
        </div>

        {/* Temporal Detail Summary */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
            <span className="text-slate-400 block text-[11px]">Threshold Limit</span>
            <span className="text-emerald-400 font-bold text-sm">
              {state.thresholdSeconds.toFixed(1)} sec
            </span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
            <span className="text-slate-400 block text-[11px]">Closure Recorded</span>
            <span className="text-red-400 font-bold text-sm">
              {state.eyeClosureDuration.toFixed(1)} sec
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            id="btn-alert-dismiss"
            onClick={dismissAlert}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            [ DISMISS ]
          </button>
          <button
            id="btn-alert-stop"
            onClick={handleStop}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>[ STOP MONITORING ]</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
          <span>Academic Prototype — Phase 1 Alert Interface Verification</span>
        </div>
      </div>
    </div>
  );
};
