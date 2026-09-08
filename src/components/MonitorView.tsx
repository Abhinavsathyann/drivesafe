import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  CameraOff,
  ScanFace,
  Eye,
  ShieldAlert,
  Play,
  Square,
  AlertTriangle,
  Code2,
  Lock,
  Clock,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Video,
  Layers,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';
import { StatusBadge } from './StatusBadge';

export const MonitorView: React.FC = () => {
  const {
    state,
    settings,
    startMonitoring,
    stopMonitoring,
    switchCameraDevice,
    attachVideoElement,
    onVideoMetadataLoaded,
    showAlert,
    saveSettings,
  } = useDriveSafe();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showContractDrawer, setShowContractDrawer] = useState(false);

  // Attach video element to context when mounted
  useEffect(() => {
    attachVideoElement(videoRef.current);
    return () => {
      attachVideoElement(null);
    };
  }, [attachVideoElement]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      onVideoMetadataLoaded(videoWidth, videoHeight);
    }
  };

  const threshold = state.thresholdSeconds || 5.0;
  const progressPercent = Math.min(100, Math.round((state.eyeClosureDuration / threshold) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Monitor Status & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white font-mono">Live Monitoring Console</h1>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PHASE 2 CAMERA PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time local browser video pipeline, frame extraction engine & hardware lifecycle
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="monitor-toggle-btn"
            onClick={state.monitoring ? stopMonitoring : startMonitoring}
            disabled={state.cameraStatus === 'REQUESTING_ACCESS'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
              state.cameraStatus === 'REQUESTING_ACCESS'
                ? 'bg-amber-600 text-white cursor-wait opacity-80'
                : state.monitoring
                ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {state.cameraStatus === 'REQUESTING_ACCESS' ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>REQUESTING ACCESS...</span>
              </>
            ) : state.monitoring ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>STOP MONITORING</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>START MONITORING</span>
              </>
            )}
          </button>

          <button
            id="test-alert-btn"
            onClick={showAlert}
            title="Preview the Phase 1 Alert Modal UI"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span className="hidden md:inline">Test Alert UI</span>
          </button>
        </div>
      </div>

      {/* Camera Device Selector & Mirror Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-lg">
        <div className="flex items-center gap-2">
          <Camera className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">Camera Source:</span>
          {state.availableCameras.length > 0 ? (
            <select
              value={settings.cameraDevice}
              onChange={(e) => switchCameraDevice(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500"
            >
              <option value="default">Default System Camera</option>
              {state.availableCameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-300">Default Camera</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={settings.mirrorCamera}
              onChange={(e) => saveSettings({ mirrorCamera: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
            />
            <span>Mirror Preview (Selfie Mode)</span>
          </label>

          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{showDiagnostics ? 'Hide Diagnostics' : 'Developer Diagnostics'}</span>
            {showDiagnostics ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Central Camera Area (Left/Center) + Analysis & Timer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Central Camera Display Area (8 Columns on desktop) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div
            id="camera-container"
            className="relative aspect-video w-full rounded-xl border-2 border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl"
          >
            {/* Real HTML5 Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={handleLoadedMetadata}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                state.streamActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${settings.mirrorCamera ? 'scale-x-[-1]' : ''}`}
            />

            {/* Overlaid Camera Framing Reticle (Visible during live feed) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Center Driver Positioning Oval Reticle */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <div className="w-52 h-72 border-2 border-dashed border-emerald-400/70 rounded-[48%] flex items-center justify-center">
                  <div className="w-36 h-12 border-t border-b border-emerald-400/50" />
                </div>
              </div>

              {/* Viewfinder Corner Brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-400/80" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-400/80" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-400/80" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-400/80" />
            </div>

            {/* Top Status Badges Overlay */}
            <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 z-10">
              <div className="flex flex-wrap items-center gap-2">
                {state.streamActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase bg-red-950/80 border border-red-500/70 text-red-300 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    ● LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase bg-slate-900/80 border border-slate-700 text-slate-400">
                    CAMERA OFF
                  </span>
                )}
                <StatusBadge type="camera" status={state.cameraStatus} size="sm" />
                <StatusBadge type="drowsiness" status={state.drowsinessRisk} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge type="face" status={state.faceStatus} size="sm" />
                <StatusBadge type="eye" status={state.eyeStatus} size="sm" />
              </div>
            </div>

            {/* Inactive / Requesting / Error State Placeholders (When stream is not active) */}
            {!state.streamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6 py-8 bg-slate-950/95">
                {state.cameraStatus === 'REQUESTING_ACCESS' ? (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-950/50 border border-amber-600/40 text-amber-400 animate-pulse">
                      <Camera className="h-10 w-10 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-widest text-amber-300 uppercase">
                      CAMERA ACCESS REQUIRED
                    </h2>
                    <p className="mt-2 text-xs font-mono text-slate-300 max-w-md">
                      Please click <strong>"Allow"</strong> when prompted by your browser to grant webcam access for local real-time monitoring.
                    </p>
                  </>
                ) : state.cameraStatus === 'ERROR' ? (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-950/50 border border-red-600/40 text-red-400">
                      <CameraOff className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-widest text-red-300 uppercase">
                      CAMERA UNAVAILABLE
                    </h2>
                    <p className="mt-2 text-xs font-mono text-red-200/90 max-w-md">
                      {state.cameraError || 'Could not initialize webcam stream.'}
                    </p>
                    <button
                      onClick={startMonitoring}
                      className="mt-4 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Retry Connection
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-500 shadow-inner">
                      <CameraOff className="h-10 w-10 text-slate-500 stroke-[1.5]" />
                    </div>
                    <h2 className="text-xl font-bold font-mono tracking-widest text-slate-300 uppercase">
                      CAMERA PREVIEW
                    </h2>
                    <p className="mt-1 text-sm font-mono text-slate-400">CAMERA NOT STARTED</p>
                    <button
                      onClick={startMonitoring}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Start Webcam Feed
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Bottom Overlay Privacy & Processing Banner */}
            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800/80 z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Camera access is used for real-time monitoring. Video is not recorded or uploaded by this application.</span>
              </div>
              <span className="hidden md:inline text-slate-500">
                {state.videoReady ? `${state.videoWidth} × ${state.videoHeight}` : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Diagnostics Panel (Collapsible) */}
          {showDiagnostics && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  Developer Diagnostics — Phase 2 Camera Pipeline
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  CLIENT TELEMETRY
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Camera</span>
                  <strong className={state.streamActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {state.streamActive ? 'CONNECTED' : 'DISCONNECTED'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Resolution</span>
                  <strong className="text-white">
                    {state.videoReady ? `${state.videoWidth} × ${state.videoHeight}` : '—'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Video Ready</span>
                  <strong className={state.videoReady ? 'text-emerald-400' : 'text-slate-400'}>
                    {state.videoReady ? 'YES' : 'NO'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Stream Active</span>
                  <strong className={state.streamActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {state.streamActive ? 'YES' : 'NO'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Frame Pipeline</span>
                  <strong className={state.streamActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {state.streamActive ? 'READY' : 'STOPPED'}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Processing FPS</span>
                  <strong className="text-emerald-400">
                    {state.streamActive ? `${state.measuredFPS} FPS` : '0 FPS'}{' '}
                    <span className="text-slate-500 font-normal">({settings.targetFPS || 10} target)</span>
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Frames Captured</span>
                  <strong className="text-white">{state.framesCaptured}</strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Mirroring</span>
                  <strong className="text-slate-300">
                    {settings.mirrorCamera ? 'PREVIEW ONLY' : 'DISABLED'}
                  </strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Note: Preview mirroring uses CSS transform and does not alter the underlying canvas frame data captured for computer vision.
              </p>
            </div>
          )}

          {/* Phase 1 & 2 Integration Contract Drawer Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-mono">
              Threshold Config: <strong className="text-emerald-400">{threshold.toFixed(1)}s</strong>
            </span>
            <button
              onClick={() => setShowContractDrawer(!showContractDrawer)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showContractDrawer ? 'Hide' : 'Inspect'} Phase 2/3 Integration Contract</span>
            </button>
          </div>

          {/* Expandable Developer / Viva Contract Schema Viewer */}
          {showContractDrawer && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  Frame Pipeline Contract Delivered in Phase 2
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  FOR EVALUATOR / VIVA
                </span>
              </div>

              <div>
                <p className="text-slate-400 mb-1">Phase 2 Frame Capture Contract (Consumed in Phase 3):</p>
                <pre className="p-2.5 rounded bg-slate-900 border border-slate-800/80 text-emerald-300 overflow-x-auto">
{`interface CapturedFrameContract {
  imageData: ImageData; // RGBA pixel array from unmirrored canvas
  width: ${state.videoWidth || 1280};
  height: ${state.videoHeight || 720};
  timestamp: ${state.lastFrameTimestamp ? state.lastFrameTimestamp.toFixed(2) : 'performance.now()'};
}`}
                </pre>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <strong>Phase 3 Hand-off:</strong> Phase 3 imports <code>captureCurrentFrame()</code> from DriveSafeContext or receives frames directly via the <code>onFrameCaptured</code> callback at the configured 10 FPS rate.
              </div>
            </div>
          )}
        </div>

        {/* Right-Side Analysis Panel (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Panel 1: Eye-State Real-Time Analysis Interface */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  Eye Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                PHASE 2 NEUTRAL
              </span>
            </div>

            {/* Left Eye & Right Eye States */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  LEFT EYE
                </span>
                <span className="text-sm font-bold font-mono text-slate-300">
                  {state.leftEyeState}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  RIGHT EYE
                </span>
                <span className="text-sm font-bold font-mono text-slate-300">
                  {state.rightEyeState}
                </span>
              </div>
            </div>

            {/* Eye Closure Duration */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  EYE CLOSURE
                </span>
                <span className="text-xs text-slate-400">Current continuous duration</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-400">
                {state.eyeClosureDuration.toFixed(1)} sec
              </span>
            </div>

            {/* ML Confidence */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  ML CONFIDENCE
                </span>
                <span className="text-xs text-slate-400">Model inference probability</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-400">
                {state.mlConfidence !== null ? `${(state.mlConfidence * 100).toFixed(1)}%` : '—'}
              </span>
            </div>

            {/* Drowsiness Risk */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  DROWSINESS RISK
                </span>
                <span className="text-xs text-slate-400">Composite safety evaluation</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-300">
                {state.drowsinessRisk === 'WAITING_FOR_ANALYSIS'
                  ? 'WAITING FOR ANALYSIS'
                  : state.drowsinessRisk === 'NOT_MONITORING'
                  ? 'NOT MONITORING'
                  : state.drowsinessRisk}
              </span>
            </div>

            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 text-[11px] text-slate-400 font-mono">
              <span className="font-semibold text-slate-300 block mb-1">Subsystem Integration Notice:</span>
              Computer vision analysis will be connected in a later phase (Phase 3). Live camera stream is active and supplying frames.
            </div>
          </div>

          {/* Panel 2: Drowsiness Timer UI Component */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  Drowsiness Timer
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                DEFAULT 05.0s
              </span>
            </div>

            {/* Dual Counter Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Eye Closure Duration
                </span>
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  0{state.eyeClosureDuration.toFixed(1)}s
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Alert Threshold
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                  0{threshold.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Progress Bar Display */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Closure Progress</span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent >= 100
                      ? 'bg-red-500'
                      : progressPercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Planned Temporal Logic Documentation */}
            <div className="rounded-lg bg-slate-950/90 border border-slate-800/80 p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Phase 7 Temporal Alarm Engine:</p>
              <p className="text-slate-400">
                Accumulates continuous closed-eye frames. When eye closure reaches {threshold.toFixed(1)}s threshold, the visual + audio alarm triggers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
