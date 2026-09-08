import React from 'react';
import {
  Camera,
  ScanFace,
  Eye,
  ShieldAlert,
  Play,
  Square,
  Cpu,
  Layers,
  Info,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';
import { StatusBadge } from './StatusBadge';

export const DashboardView: React.FC = () => {
  const { state, startMonitoring, stopMonitoring, setCurrentTab } = useDriveSafe();

  const pipelineStages = [
    { name: '1. Webcam Stream', tech: 'Browser getUserMedia', phase: 'Phase 2 (Active)' },
    { name: '2. Face Detection', tech: 'MediaPipe / Haar Cascade', phase: 'Phase 3' },
    { name: '3. Eye Localization', tech: 'Landmark Extraction', phase: 'Phase 3' },
    { name: '4. Preprocessing', tech: 'Grayscale / Normalization', phase: 'Phase 4' },
    { name: '5. ML Classification', tech: 'TensorFlow/Keras CNN', phase: 'Phase 5/6' },
    { name: '6. Temporal Tracker', tech: 'Continuous Timer (5.0s)', phase: 'Phase 7' },
    { name: '7. Decision Engine', tech: 'Threshold Evaluator', phase: 'Phase 7' },
    { name: '8. Safety Warning', tech: 'Visual + Audio Alerts', phase: 'Phase 7' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Main Call-to-Action */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {state.monitoring ? 'MONITORING ACTIVE' : 'CAMERA PIPELINE READY'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                BCA College Final Year Prototype
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              DriveSafe<span className="text-emerald-400"> AI</span>
            </h1>

            <p className="text-base text-slate-300 font-medium">
              Real-Time Driver Drowsiness Monitoring
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Phase 2 connects real-time browser webcam streaming and establishes the modular frame-capture
              pipeline to supply frames for computer vision analysis without external uploads.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-emerald-400/90">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Camera access is used for real-time monitoring. Video is not recorded or uploaded by this application.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
            <button
              id="dashboard-start-monitoring-btn"
              onClick={state.monitoring ? stopMonitoring : startMonitoring}
              disabled={state.cameraStatus === 'REQUESTING_ACCESS'}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg font-mono text-sm font-bold uppercase tracking-wider shadow-lg transition-all ${
                state.cameraStatus === 'REQUESTING_ACCESS'
                  ? 'bg-amber-600 text-white cursor-wait opacity-80'
                  : state.monitoring
                  ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-red-950/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
              }`}
            >
              {state.cameraStatus === 'REQUESTING_ACCESS' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>REQUESTING ACCESS...</span>
                </>
              ) : state.monitoring ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  <span>STOP MONITORING</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>START MONITORING</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('about')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              <span>View System Architecture</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
            System Subsystem Status
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {state.monitoring ? 'Live Pipeline Active' : 'System Standby'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Camera Status */}
          <div
            id="card-camera-status"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Video Input</span>
                <Camera className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Camera Status</h3>
              <p className="text-xs text-slate-400 mt-1">Webcam hardware optical stream</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <StatusBadge type="camera" status={state.cameraStatus} />
            </div>
          </div>

          {/* Card 2: Face Detection */}
          <div
            id="card-face-detection"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Computer Vision</span>
                <ScanFace className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Face Detection</h3>
              <p className="text-xs text-slate-400 mt-1">Facial bounding box localization</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <StatusBadge type="face" status={state.faceStatus} />
            </div>
          </div>

          {/* Card 3: Eye Analysis */}
          <div
            id="card-eye-analysis"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">ML Classification</span>
                <Eye className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Eye Analysis</h3>
              <p className="text-xs text-slate-400 mt-1">OPEN / CLOSED state classification</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <StatusBadge type="eye" status={state.eyeStatus} />
            </div>
          </div>

          {/* Card 4: Drowsiness Status */}
          <div
            id="card-drowsiness-status"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Safety Engine</span>
                <ShieldAlert className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Drowsiness Status</h3>
              <p className="text-xs text-slate-400 mt-1">Temporal closure decision (5s)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <StatusBadge type="drowsiness" status={state.drowsinessRisk} />
            </div>
          </div>
        </div>
      </div>

      {/* Planned End-to-End Pipeline Architecture Flow */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              End-to-End Processing Pipeline Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The full architectural sequence from webcam capture to safety alert warning
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
            Stage 1 Implemented
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {pipelineStages.map((stage, index) => (
            <div
              key={stage.name}
              className={`rounded-lg border p-3.5 flex flex-col justify-between relative group transition-colors ${
                index === 0
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className={index === 0 ? 'text-emerald-400' : 'text-slate-500'}>
                  STAGE 0{index + 1}
                </span>
                <span
                  className={
                    index === 0
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-400 font-semibold'
                  }
                >
                  {stage.phase}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 mt-1">{stage.name}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">{stage.tech}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Development Roadmap */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-mono">
              10-Phase BCA Project Development Protocol
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Strict Phase Discipline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Phase 1 */}
          <div className="rounded-lg border-2 border-emerald-500/80 bg-emerald-950/30 p-3">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold mb-1">
              <span>PHASE 1</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white">Foundation & UI/UX</p>
            <p className="text-[11px] text-emerald-300/80 mt-1 font-mono">COMPLETED</p>
          </div>

          {/* Phase 2 */}
          <div className="rounded-lg border-2 border-emerald-400 bg-emerald-950/40 p-3 shadow-md shadow-emerald-950/30">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold mb-1">
              <span>PHASE 2</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white">Webcam Pipeline</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">COMPLETED</p>
          </div>

          {[
            { phase: 'PHASE 3', title: 'Computer Vision', desc: 'Face & eye detection' },
            { phase: 'PHASE 4', title: 'Dataset & Prep', desc: 'Eye image processing' },
            { phase: 'PHASE 5', title: 'ML Model Training', desc: 'Open/Closed classifier' },
            { phase: 'PHASE 6', title: 'Real-Time Inference', desc: 'Model integration' },
            { phase: 'PHASE 7', title: 'Temporal Alerts', desc: '5s logic & alarm' },
            { phase: 'PHASE 8', title: 'Analytics Dashboard', desc: 'Session metrics & charts' },
            { phase: 'PHASE 9', title: 'Testing & Accuracy', desc: 'Edge-case validation' },
            { phase: 'PHASE 10', title: 'Viva & Deployment', desc: 'Report & presentation' },
          ].map((item) => (
            <div
              key={item.phase}
              className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 opacity-70 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>{item.phase}</span>
                <Lock className="h-3 w-3 text-slate-500" />
              </div>
              <p className="text-xs font-medium text-slate-300">{item.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer & Security Foundation */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200/90 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300 uppercase tracking-wide font-mono">
            Academic Prototype Disclaimer & Privacy Notice
          </p>
          <p className="leading-relaxed text-amber-200/80">
            This software is an educational prototype developed for a BCA final year project and is{' '}
            <strong>NOT a certified automotive safety system</strong>. It does not guarantee
            accident prevention and cannot replace certified driver monitoring hardware. All webcam
            data is processed locally in memory on the client machine to preserve user privacy.
          </p>
        </div>
      </div>
    </div>
  );
};
