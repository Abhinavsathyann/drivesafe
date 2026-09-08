/**
 * DriveSafe AI — Centralized Application State Management
 * Implements Phase 1 & Phase 2 state architecture, camera lifecycle & frame pipeline
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  AppState,
  SettingsState,
  SessionStats,
  NavigationTab,
  CameraStatus,
  CameraPermissionState,
  FaceStatus,
  EyeStatus,
  DrowsinessRisk,
  EyeState,
  SystemErrorCode,
  CameraDeviceInfo,
  CapturedFrameContract,
  MlPredictionContract,
  CvPipelineResultContract,
} from '../types/drivesafe';
import {
  isCameraSupported,
  requestCameraStream,
  stopCameraStream,
  parseCameraError,
  enumerateCameras,
  FramePipelineManager,
} from '../services/camera';

const DEFAULT_SETTINGS: SettingsState = {
  thresholdSeconds: 5.0,
  alertSound: true,
  alertVolume: 80,
  cameraDevice: 'default',
  mirrorCamera: true,
  confidenceThreshold: 0.8,
  targetFPS: 10,
};

const INITIAL_APP_STATE: AppState = {
  cameraConnected: false,
  monitoring: false,
  faceDetected: false,
  leftEyeState: 'UNKNOWN',
  rightEyeState: 'UNKNOWN',
  eyeClosureDuration: 0.0,
  mlConfidence: null,
  drowsinessRisk: 'NOT_MONITORING',
  alertActive: false,
  thresholdSeconds: 5.0,
  sessionStartTime: null,
  cameraStatus: 'NOT_CONNECTED',
  cameraPermission: 'UNKNOWN',
  cameraError: null,
  faceStatus: 'WAITING',
  eyeStatus: 'WAITING',
  activeError: null,

  // Phase 2 Diagnostics & Pipeline State
  videoReady: false,
  videoWidth: 0,
  videoHeight: 0,
  streamActive: false,
  targetFPS: 10,
  measuredFPS: 0,
  framesCaptured: 0,
  lastFrameTimestamp: null,
  availableCameras: [],
};

const INITIAL_SESSION_STATS: SessionStats = {
  monitoringDuration: '00:00',
  drowsinessEvents: 0,
  longestEyeClosure: '—',
  averageConfidence: '—',
};

interface DriveSafeContextValue {
  state: AppState;
  settings: SettingsState;
  sessionStats: SessionStats;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  // Core action functions
  initializeApplication: () => void;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  switchCameraDevice: (deviceId: string) => Promise<void>;
  attachVideoElement: (videoEl: HTMLVideoElement | null) => void;
  onVideoMetadataLoaded: (width: number, height: number) => void;
  updateCameraStatus: (status: CameraStatus, connected?: boolean) => void;
  updateFaceStatus: (status: FaceStatus, detected?: boolean) => void;
  updateEyeStatus: (status: EyeStatus, left?: EyeState, right?: EyeState) => void;
  updateDrowsinessStatus: (risk: DrowsinessRisk) => void;
  updateClosureTimer: (seconds: number) => void;
  showAlert: () => void;
  dismissAlert: () => void;
  resetMonitoringState: () => void;
  saveSettings: (newSettings: Partial<SettingsState>) => void;
  loadSettings: () => SettingsState;
  setActiveError: (error: SystemErrorCode | null) => void;
  // Manual frame capture method (exposed for Phase 3 consumption)
  captureCurrentFrame: () => CapturedFrameContract | null;
  // Future interface contracts hooks (for testing in Phase 1 & 2)
  injectMlPredictionContract: (prediction: MlPredictionContract) => void;
  injectCvPipelineResult: (result: CvPipelineResultContract) => void;
}

const DriveSafeContext = createContext<DriveSafeContextValue | null>(null);

const SETTINGS_STORAGE_KEY = 'drivesafe_ai_settings_v2';

export const DriveSafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [state, setState] = useState<AppState>(INITIAL_APP_STATE);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [sessionStats] = useState<SessionStats>(INITIAL_SESSION_STATS);

  // References to keep media stream and video element outside React state
  const activeStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const framePipelineRef = useRef<FramePipelineManager>(new FramePipelineManager());
  const isStartingRef = useRef<boolean>(false);

  // Load settings and discover devices on mount
  useEffect(() => {
    initializeApplication();

    // Tab visibility handling: pause frame processing when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[DriveSafe] Page hidden, frame extraction paused');
      } else {
        console.log('[DriveSafe] Page visible, frame extraction active');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopMonitoring();
    };
  }, []);

  const loadSettings = (): SettingsState => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);
        setState((prev) => ({
          ...prev,
          thresholdSeconds: merged.thresholdSeconds,
          targetFPS: merged.targetFPS || 10,
        }));
        return merged;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  };

  const saveSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Fallback
      }

      if (newSettings.thresholdSeconds !== undefined) {
        setState((s) => ({ ...s, thresholdSeconds: newSettings.thresholdSeconds! }));
      }
      if (newSettings.targetFPS !== undefined) {
        setState((s) => ({ ...s, targetFPS: newSettings.targetFPS! }));
      }
      return updated;
    });
  };

  const initializeApplication = () => {
    loadSettings();
    setState(INITIAL_APP_STATE);

    // Initial check for camera support and devices
    if (isCameraSupported()) {
      enumerateCameras().then((cameras) => {
        if (cameras.length > 0) {
          setState((prev) => ({ ...prev, availableCameras: cameras }));
        }
      });
    }
  };

  /**
   * Phase 2: Start Monitoring & Camera Acquisition Lifecycle
   */
  const startMonitoring = async () => {
    // Prevent double-click race condition
    if (isStartingRef.current || state.cameraStatus === 'REQUESTING_ACCESS') {
      return;
    }
    isStartingRef.current = true;

    // Immediately stop any existing stream
    if (activeStreamRef.current) {
      stopCameraStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }

    // Set initial requesting status
    setState((prev) => ({
      ...prev,
      monitoring: true,
      cameraStatus: 'REQUESTING_ACCESS',
      cameraPermission: 'REQUESTING',
      cameraError: null,
      activeError: null,
      drowsinessRisk: 'WAITING_FOR_ANALYSIS',
      faceStatus: 'WAITING_FOR_DETECTION',
      eyeStatus: 'WAITING_FOR_DETECTION',
      sessionStartTime: Date.now(),
    }));
    setCurrentTab('monitor');

    try {
      const stream = await requestCameraStream(settings.cameraDevice);
      activeStreamRef.current = stream;

      // Handle external track termination (e.g. camera unplugged)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.warn('[DriveSafe] Camera track ended externally');
          stopMonitoring();
          setState((prev) => ({
            ...prev,
            cameraStatus: 'ERROR',
            cameraError: 'Camera disconnected unexpectedly.',
            activeError: 'CAMERA_UNAVAILABLE',
          }));
        };
      }

      // If video element is already mounted, attach stream immediately
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch((playErr) => {
          console.warn('[DriveSafe] Video play catch:', playErr);
        });
      }

      // Enumerate available cameras now that permission has been granted
      const available = await enumerateCameras();

      setState((prev) => ({
        ...prev,
        cameraConnected: true,
        cameraStatus: 'CONNECTED',
        cameraPermission: 'GRANTED',
        cameraError: null,
        streamActive: true,
        availableCameras: available.length > 0 ? available : prev.availableCameras,
      }));
    } catch (err: any) {
      console.error('[DriveSafe] Camera start failed:', err);
      const parsed = parseCameraError(err);

      setState((prev) => ({
        ...prev,
        monitoring: false,
        cameraConnected: false,
        cameraStatus: 'ERROR',
        cameraPermission: parsed.code === 'CAMERA_PERMISSION_DENIED' ? 'DENIED' : 'ERROR',
        cameraError: parsed.message,
        activeError: parsed.code,
        drowsinessRisk: 'NOT_MONITORING',
        faceStatus: 'WAITING',
        eyeStatus: 'WAITING',
        streamActive: false,
      }));
    } finally {
      isStartingRef.current = false;
    }
  };

  /**
   * Phase 2: Stop Monitoring & Clean Camera Release Lifecycle
   */
  const stopMonitoring = () => {
    isStartingRef.current = false;

    // 1. Stop frame capture pipeline
    framePipelineRef.current.stop();

    // 2. Stop every active track in MediaStream
    if (activeStreamRef.current) {
      stopCameraStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }

    // 3. Clear video element source and reset
    if (videoElementRef.current) {
      try {
        videoElementRef.current.pause();
        videoElementRef.current.srcObject = null;
      } catch (e) {
        console.warn('Error clearing video source', e);
      }
    }

    // 4. Update state to cleanly reflect stopped state
    setState((prev) => ({
      ...prev,
      monitoring: false,
      cameraConnected: false,
      cameraStatus: 'DISCONNECTED',
      cameraPermission: prev.cameraPermission === 'DENIED' ? 'DENIED' : 'STOPPED',
      streamActive: false,
      videoReady: false,
      faceStatus: 'WAITING',
      eyeStatus: 'WAITING',
      faceDetected: false,
      leftEyeState: 'UNKNOWN',
      rightEyeState: 'UNKNOWN',
      eyeClosureDuration: 0.0,
      drowsinessRisk: 'NOT_MONITORING',
      alertActive: false,
      sessionStartTime: null,
      measuredFPS: 0,
      framesCaptured: 0,
    }));
  };

  /**
   * Switch Camera Device (from Settings or Monitor controls)
   */
  const switchCameraDevice = async (deviceId: string) => {
    saveSettings({ cameraDevice: deviceId });

    if (state.monitoring) {
      // Re-start camera with new deviceId
      await startMonitoring();
    }
  };

  /**
   * Attach video element when mounted in DOM
   */
  const attachVideoElement = (videoEl: HTMLVideoElement | null) => {
    videoElementRef.current = videoEl;

    if (videoEl && activeStreamRef.current) {
      videoEl.srcObject = activeStreamRef.current;
      videoEl.play().catch(() => {});
    }
  };

  /**
   * Called when video metadata (dimensions) are ready
   */
  const onVideoMetadataLoaded = (width: number, height: number) => {
    setState((prev) => ({
      ...prev,
      videoReady: true,
      videoWidth: width,
      videoHeight: height,
    }));

    // Start Phase 2 frame capture pipeline foundation
    if (videoElementRef.current) {
      framePipelineRef.current.start(
        videoElementRef.current,
        settings.targetFPS || 10,
        (frame) => {
          // Future Phase 3 hook:
          // In Phase 3, this frame will be passed to face_detection and eye_detection!
          setState((prev) => ({
            ...prev,
            lastFrameTimestamp: frame.timestamp,
          }));
        },
        (diagnostics) => {
          setState((prev) => ({
            ...prev,
            measuredFPS: diagnostics.measuredFPS,
            framesCaptured: diagnostics.framesCaptured,
            videoWidth: diagnostics.width,
            videoHeight: diagnostics.height,
          }));
        }
      );
    }
  };

  /**
   * Directly captures current frame from the pipeline on demand
   */
  const captureCurrentFrame = (): CapturedFrameContract | null => {
    return framePipelineRef.current.captureCurrentFrame();
  };

  const updateCameraStatus = (status: CameraStatus, connected = false) => {
    setState((prev) => ({
      ...prev,
      cameraStatus: status,
      cameraConnected: connected,
    }));
  };

  const updateFaceStatus = (status: FaceStatus, detected = false) => {
    setState((prev) => ({
      ...prev,
      faceStatus: status,
      faceDetected: detected,
    }));
  };

  const updateEyeStatus = (
    status: EyeStatus,
    left: EyeState = 'UNKNOWN',
    right: EyeState = 'UNKNOWN'
  ) => {
    setState((prev) => ({
      ...prev,
      eyeStatus: status,
      leftEyeState: left,
      rightEyeState: right,
    }));
  };

  const updateDrowsinessStatus = (risk: DrowsinessRisk) => {
    setState((prev) => ({
      ...prev,
      drowsinessRisk: risk,
    }));
  };

  const updateClosureTimer = (seconds: number) => {
    setState((prev) => ({
      ...prev,
      eyeClosureDuration: Math.max(0, seconds),
    }));
  };

  const showAlert = () => {
    setState((prev) => ({
      ...prev,
      alertActive: true,
      drowsinessRisk: 'DROWSINESS_ALERT',
    }));
  };

  const dismissAlert = () => {
    setState((prev) => ({
      ...prev,
      alertActive: false,
      drowsinessRisk: prev.monitoring ? 'WAITING_FOR_ANALYSIS' : 'NOT_MONITORING',
      eyeClosureDuration: 0.0,
    }));
  };

  const resetMonitoringState = () => {
    stopMonitoring();
    setState((prev) => ({
      ...INITIAL_APP_STATE,
      thresholdSeconds: prev.thresholdSeconds,
    }));
  };

  const setActiveError = (error: SystemErrorCode | null) => {
    setState((prev) => ({
      ...prev,
      activeError: error,
    }));
  };

  // Phase 1 test contract injection hooks:
  const injectMlPredictionContract = (prediction: MlPredictionContract) => {
    setState((prev) => ({
      ...prev,
      leftEyeState: prediction.left_eye,
      rightEyeState: prediction.right_eye,
      mlConfidence: prediction.confidence,
    }));
  };

  const injectCvPipelineResult = (result: CvPipelineResultContract) => {
    setState((prev) => ({
      ...prev,
      faceDetected: result.faceDetected,
      leftEyeState: result.leftEyeState,
      rightEyeState: result.rightEyeState,
      mlConfidence: result.confidence,
    }));
  };

  return (
    <DriveSafeContext.Provider
      value={{
        state,
        settings,
        sessionStats,
        currentTab,
        setCurrentTab,
        initializeApplication,
        startMonitoring,
        stopMonitoring,
        switchCameraDevice,
        attachVideoElement,
        onVideoMetadataLoaded,
        updateCameraStatus,
        updateFaceStatus,
        updateEyeStatus,
        updateDrowsinessStatus,
        updateClosureTimer,
        showAlert,
        dismissAlert,
        resetMonitoringState,
        saveSettings,
        loadSettings,
        setActiveError,
        captureCurrentFrame,
        injectMlPredictionContract,
        injectCvPipelineResult,
      }}
    >
      {children}
    </DriveSafeContext.Provider>
  );
};

export const useDriveSafe = (): DriveSafeContextValue => {
  const context = useContext(DriveSafeContext);
  if (!context) {
    throw new Error('useDriveSafe must be used within a DriveSafeProvider');
  }
  return context;
};
