import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  Save,
  Check,
  Lock,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';

export const SettingsView: React.FC = () => {
  const { state, settings, saveSettings } = useDriveSafe();

  const [form, setForm] = useState({
    thresholdSeconds: settings.thresholdSeconds,
    alertSound: settings.alertSound,
    alertVolume: settings.alertVolume,
    cameraDevice: settings.cameraDevice,
    mirrorCamera: settings.mirrorCamera,
    confidenceThreshold: settings.confidenceThreshold,
    targetFPS: settings.targetFPS || 10,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults = {
      thresholdSeconds: 5.0,
      alertSound: true,
      alertVolume: 80,
      cameraDevice: 'default',
      mirrorCamera: true,
      confidenceThreshold: 0.8,
      targetFPS: 10,
    };
    setForm(defaults);
    saveSettings(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono">System Configuration</h1>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PHASE 2 CAMERA & THRESHOLDS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure safety thresholds, camera device source, processing frame rate, and mirror modes
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-mono">
            <Check className="h-3.5 w-3.5" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Camera & Pipeline Settings (Phase 2) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-400" />
                Camera & Frame Pipeline Preferences
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time video source & processing controls</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              PHASE 2 ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Camera Selection */}
            <div className="space-y-2">
              <label htmlFor="cameraDevice" className="text-xs font-mono text-slate-200 font-semibold block">
                Video Input Device
              </label>
              <p className="text-xs text-slate-400">Select active hardware camera source</p>
              <select
                id="cameraDevice"
                value={form.cameraDevice}
                onChange={(e) => setForm({ ...form, cameraDevice: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                <option value="default">Default System Camera</option>
                {state.availableCameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Processing FPS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label htmlFor="targetFPS" className="text-slate-200 font-semibold">
                  CV Processing Rate
                </label>
                <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {form.targetFPS} FPS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frame extraction rate for background analysis (decoupled from display rate)
              </p>
              <div className="pt-1">
                <input
                  id="targetFPS"
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={form.targetFPS}
                  onChange={(e) => setForm({ ...form, targetFPS: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>5 FPS (Low CPU)</span>
                  <span>10 FPS (Recommended)</span>
                  <span>30 FPS (Max)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mirror Camera */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-mono text-slate-200 font-semibold block">
                  Mirror Video Preview
                </label>
                <p className="text-xs text-slate-400 max-w-xl">
                  Flips the visual video feed horizontally (selfie mode) for intuitive driver feedback.
                  Underlying frame data captured for computer vision remains unaltered in standard orientation.
                </p>
              </div>
              <button
                type="button"
                id="toggle-mirror-cam"
                onClick={() => setForm({ ...form, mirrorCamera: !form.mirrorCamera })}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  form.mirrorCamera
                    ? 'bg-slate-800 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {form.mirrorCamera ? 'MIRRORED (ON)' : 'NATURAL (OFF)'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Functional Phase 1 Settings (Alerts & Thresholds) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Alert & Safety Thresholds
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Drowsiness trigger sensitivity</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              FUNCTIONAL
            </span>
          </div>

          {/* Drowsiness Alert Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <label htmlFor="thresholdSeconds" className="text-slate-200 font-semibold">
                Drowsiness Alert Threshold (Eye Closure Duration)
              </label>
              <span className="text-emerald-400 font-bold text-sm bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {form.thresholdSeconds.toFixed(1)} seconds
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Default is <strong>5.0 seconds</strong>. Continuous eye closure reaching this threshold
              triggers the drowsiness safety alert.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <input
                id="thresholdSeconds"
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={form.thresholdSeconds}
                onChange={(e) =>
                  setForm({ ...form, thresholdSeconds: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-500 shrink-0">1.0s – 10.0s</span>
            </div>
          </div>

          {/* Audio Feedback Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Alert Sound Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-200 font-semibold block">
                Alert Sound
              </label>
              <p className="text-xs text-slate-400">Auditory warning buzzer on threshold trigger</p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  id="toggle-alert-sound"
                  onClick={() => setForm({ ...form, alertSound: !form.alertSound })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-colors ${
                    form.alertSound
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {form.alertSound ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>SOUND ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      <span>SOUND OFF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Alert Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label htmlFor="alertVolume" className="text-slate-200 font-semibold">
                  Alert Volume
                </label>
                <span className="text-slate-300 font-bold">{form.alertVolume}%</span>
              </div>
              <p className="text-xs text-slate-400">Output decibel gain for warning beep</p>
              <div className="pt-1">
                <input
                  id="alertVolume"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  disabled={!form.alertSound}
                  value={form.alertVolume}
                  onChange={(e) => setForm({ ...form, alertVolume: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Future ML Settings (Clearly Distinguished) */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-500" />
                Future Machine-Learning Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reserved configurations for deep learning inference in Phase 5 & 6
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              RESERVED FOR PHASES 5–6
            </span>
          </div>

          {/* Detection Confidence Threshold */}
          <div className="space-y-2 opacity-75">
            <div className="flex justify-between items-center text-xs font-mono">
              <label htmlFor="confidenceThreshold" className="text-slate-300 font-medium">
                Detection Confidence Threshold (ML Inference)
              </label>
              <span className="text-slate-400 font-bold text-sm bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                {(form.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Minimum softmax probability required before accepting an OPEN or CLOSED prediction.
              Will be passed into the Keras inference engine in Phase 6.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <input
                id="confidenceThreshold"
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={form.confidenceThreshold}
                onChange={(e) =>
                  setForm({ ...form, confidenceThreshold: parseFloat(e.target.value) })
                }
                className="w-full accent-slate-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-500 shrink-0">50% – 95%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Academic Defaults (5.0s, 10 FPS)</span>
          </button>

          <button
            type="submit"
            id="save-settings-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
